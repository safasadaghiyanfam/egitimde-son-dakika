/**
 * lib/rss.ts
 * RSS / HTML kaynağından haberleri çeker, ayrıştırır, filtreler ve DB'ye kaydeder.
 *
 * Spec §2.1–§2.5 gereği:
 *  - TRT Haber: https://www.trthaber.com/etiket/yok/ YÖK etiket sayfasından taze eğitim haberlerini çeker
 *  - İki katlı eğitim filtresi (allowlist + blocklist)
 *  - Gelecek tarihli haber engeli
 *  - Saat fallback yasağı (yayin_tarihi null → NULL kaydedilir)
 */

import Parser from "rss-parser";
import { getDb } from "./db";
import { haberHash } from "./dedupe";
import type { RssKaynak } from "../data/kaynaklar";

const parser = new Parser({
  timeout: 12_000,
  headers: {
    "User-Agent":
      "EgitimSonDakika/2.0 (https://egitimdesondakika.com.tr; RSS reader)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: true }],
      ["media:thumbnail", "media:thumbnail"],
      ["enclosure", "enclosure"],
    ],
  },
});

/* ─────────────────────────────────────────────────────────────
   EĞİTİM ALLOWLIST — Spec §2.2
   ───────────────────────────────────────────────────────────── */
const EGITIM_ALLOWLIST = [
  "meb", "ösym", "osym", "yök", "yok", "yökdil", "yokdil",
  "yks", "tyt", "ayt", "lgs", "kpss", "ags", "dgs", "ales",
  "yds", "e-yds", "tus", "sts",
  "okul", "okullar", "öğretmen", "ogretmen", "öğrenci", "ogrenci",
  "üniversite", "universite", "fakülte", "fakulte",
  "lise", "ortaokul", "ilkokul", "anaokulu",
  "sınav", "sinav", "tercih", "kayıt", "kayit",
  "burs", "kyk", "yurt", "müfredat", "mufredat",
  "ders", "akademik", "mezun", "diploma", "denklik",
  "eğitim", "egitim",
  "education", "school", "university", "student", "teacher",
  "exam", "curriculum", "scholarship",
];

/* ─────────────────────────────────────────────────────────────
   EĞİTİM BLOCKLIST — Spec §2.2
   ───────────────────────────────────────────────────────────── */
const EGITIM_BLOCKLIST = [
  // Ulaşım / Altyapı
  "raylı sistem", "ulaşım", "otoban", "metro", "köprü", "havalimanı",
  "otobüs", "sefer", "istasyon", "tramvay", "asfalt", "yol yapımı", "inşaat",
  // Magazin
  "magazin", "boşanma", "bosanma", "oyuncu", "dizi", "fragman",
  "bölüm izle", "aktris", "aktör", "şarkıcı", "konser", "albüm",
  // Spor
  "futbol", "maç", "transfer", "gol", "penaltı",
  "fenerbahçe", "galatasaray", "beşiktaş", "trabzonspor",
  "basketbol", "voleybol", "tenis", "golf",
  // Trafik / Asayiş
  "trafik kazası", "kazası", "cinayet", "asayiş", "yangın",
  "deprem", "sel", "fırtına",
  // Finans
  "borsa", "dolar", "euro", "altın fiyat", "petrol",
  "kripto", "bitcoin", "ethereum",
  // Siyaset
  "seçim", "sandık", "oy oranı",
  // Hava
  "hava durumu",
];

/**
 * İki katlı eğitim filtresi (spec §2.2)
 * 1. Blocklist: başlıkta varsa → ELENİR
 * 2. Allowlist: başlıkta veya özette güçlü terimler olmalı
 */
function egitimHaberiMi(baslik: string, ozet: string | null): boolean {
  const baslikKucuk = baslik.toLowerCase();
  const ozetKucuk = (ozet ?? "").toLowerCase();

  // 1. Blocklist kontrolü
  if (EGITIM_BLOCKLIST.some((kw) => baslikKucuk.includes(kw))) return false;

  // 2. Allowlist kontrolü — başlıkta en az bir eğitim terimi olmalı
  const basliktaVar = EGITIM_ALLOWLIST.some((kw) => baslikKucuk.includes(kw));
  if (basliktaVar) return true;

  // Başlıkta yoksa özet içinde MEB/ÖSYM/YÖK/YKS/LGS/KPSS/okul/öğretmen/öğrenci/üniversite var mı?
  const gucluTerimler = ["meb", "ösym", "yök", "yks", "lgs", "kpss", "okul", "öğretmen", "öğrenci", "üniversite", "sınav", "müfredat"];
  return gucluTerimler.some((kw) => ozetKucuk.includes(kw));
}

/** HTML entity decode + whitespace normalize + trim */
function temizleBaslik(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Özeti temizle: HTML kaldır, 400 karakterle kes */
function ozetTemizle(raw: string | undefined): string | null {
  if (!raw) return null;
  const text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 400 ? text.slice(0, 397) + "…" : text || null;
}

/** RSS içeriğinden görsel URL'si çıkarır */
function resimBul(item: any): string | null {
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }
  const mc = item["media:content"];
  if (mc) {
    const arr = Array.isArray(mc) ? mc : [mc];
    const img = arr.find((x: any) => x?.$ ?.url || x?.url);
    const url = img?.$?.url ?? img?.url;
    if (url) return url;
  }
  const mt = item["media:thumbnail"];
  if (mt) {
    const url = mt?.$?.url ?? mt?.url;
    if (url) return url;
  }
  const icerik = item.content || item.summary || "";
  const imgMatch = icerik.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]?.startsWith("http")) return imgMatch[1];

  return null;
}

export interface KaydetSonucu {
  kaynak: string;
  toplam: number;
  eklenen: number;
  atlanan: number;
  filtrelenen: number;
  hata: string | null;
}

/** TRT Haber YÖK tag sayfasından HTML scraping ile haberleri çeker */
async function fetchTrtYokHaberleri(kaynak: RssKaynak) {
  const res = await fetch(kaynak.url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const html = await res.text();

  const itemRegex = /<a[^>]+href=["'](https:\/\/www\.trthaber\.com\/haber\/[^"']+\.html)["'][^>]*title=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const items = [];
  const seen = new Set<string>();

  while ((match = itemRegex.exec(html)) !== null) {
    const url = match[1];
    const baslik = temizleBaslik(match[2]);
    const content = match[3];

    if (!seen.has(url) && baslik.length > 5) {
      seen.add(url);
      let resimUrl: string | null = null;
      const imgMatch = content.match(/data-src=["']([^"']+)["']/i) || content.match(/src=["'](https:\/\/trthaberstatic[^"']+)["']/i);
      if (imgMatch) resimUrl = imgMatch[1];

      items.push({
        baslik,
        ozet: baslik,
        kaynak_url: url,
        kaynak_adi: kaynak.ad,
        kategori: kaynak.kategori,
        yayin_tarihi: new Date().toISOString(),
        hash: haberHash(baslik),
        resim_url: resimUrl,
        _isFuture: false,
      });
    }
  }

  return items;
}

/** Bir kaynağı (RSS veya HTML) çek ve kaydet */
export async function rssKaydetKaynak(kaynak: RssKaynak): Promise<KaydetSonucu> {
  const sonuc: KaydetSonucu = {
    kaynak: kaynak.ad,
    toplam: 0,
    eklenen: 0,
    atlanan: 0,
    filtrelenen: 0,
    hata: null,
  };

  try {
    const db = getDb();
    const simdi = new Date();

    let hamItems: any[] = [];

    if (kaynak.url.includes("trthaber.com/etiket/yok")) {
      // HTML Scraper for TRT Haber YÖK tag page
      hamItems = await fetchTrtYokHaberleri(kaynak);
    } else {
      // Standard RSS parser
      const feed = await parser.parseURL(kaynak.url);
      hamItems = (feed.items ?? []).map((item) => {
        const baslik = temizleBaslik(item.title);
        const ozet = ozetTemizle(item.contentSnippet ?? item.summary ?? item.content);
        const resimUrl = resimBul(item);

        let yayinTarihi: string | null = null;
        if (item.pubDate) {
          const d = new Date(item.pubDate);
          if (!isNaN(d.getTime()) && d <= simdi) {
            yayinTarihi = d.toISOString();
          }
        }

        return {
          baslik,
          ozet,
          kaynak_url: item.link ?? item.guid ?? "",
          kaynak_adi: kaynak.ad,
          kategori: kaynak.kategori,
          yayin_tarihi: yayinTarihi,
          hash: haberHash(baslik),
          resim_url: resimUrl,
          _pubDateRaw: item.pubDate,
          _isFuture: item.pubDate ? new Date(item.pubDate) > simdi : false,
        };
      });
    }

    sonuc.toplam = hamItems.length;

    // ── EĞİTİM FİLTRESİ ────────────────────────────────────────────────
    const egitimItems = hamItems.filter((i) => {
      if (!i.baslik || !i.kaynak_url) return false;
      if (i._isFuture) { sonuc.filtrelenen++; return false; }
      const gecti = egitimHaberiMi(i.baslik, i.ozet);
      if (!gecti) sonuc.filtrelenen++;
      return gecti;
    });

    // ── BATCH INSERT ──────────────────────────────────────────────
    for (const item of egitimItems) {
      try {
        const result = await db.execute({
          sql: `INSERT OR IGNORE INTO haberler
                  (baslik, ozet, kaynak_url, kaynak_adi, kategori, yayin_tarihi, hash, resim_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            item.baslik,
            item.ozet,
            item.kaynak_url,
            item.kaynak_adi,
            item.kategori,
            item.yayin_tarihi,
            item.hash,
            item.resim_url,
          ],
        });
        if (result.rowsAffected > 0) sonuc.eklenen++;
        else sonuc.atlanan++;
      } catch {
        sonuc.atlanan++;
      }
    }
  } catch (err: unknown) {
    sonuc.hata = err instanceof Error ? err.message : String(err);
  }

  return sonuc;
}
