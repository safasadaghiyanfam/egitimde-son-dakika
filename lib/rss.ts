/**
 * lib/rss.ts
 * RSS kaynağını çeker, ayrıştırır, filtreler ve DB'ye kaydeder.
 *
 * Spec §2.1–§2.5 gereği:
 *  - İki katlı eğitim filtresi (allowlist + blocklist)
 *  - Gelecek tarihli haber engeli
 *  - Saat fallback yasağı (yayin_tarihi null → NULL kaydedilir)
 *  - Başlık temizleme (HTML entity + trim)
 *  - Görsel çıkarma (enclosure / media:content / img)
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
   En az bir terim başlık+özet içinde bulunmalı
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
  // İngilizce (AA/TRT İngilizce içerik için)
  "education", "school", "university", "student", "teacher",
  "exam", "curriculum", "scholarship",
];

/* ─────────────────────────────────────────────────────────────
   EĞİTİM BLOCKLIST — Spec §2.2
   Başlık bu terimleri içeriyorsa haber ELENİR
   ───────────────────────────────────────────────────────────── */
const EGITIM_BLOCKLIST = [
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
 * 1. Blocklist: başlıkta varsa → ELENDR
 * 2. Allowlist: başlık+özette en az 1 güçlü terim → GEÇ
 */
function egitimHaberiMi(baslik: string, ozet: string | null): boolean {
  const baslikKucuk = baslik.toLowerCase();

  // 1. Blocklist kontrolü
  if (EGITIM_BLOCKLIST.some((kw) => baslikKucuk.includes(kw))) return false;

  // 2. Allowlist kontrolü
  const metin = `${baslikKucuk} ${(ozet ?? "").toLowerCase()}`;
  return EGITIM_ALLOWLIST.some((kw) => metin.includes(kw));
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
  // 1. Enclosure
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }
  // 2. media:content
  const mc = item["media:content"];
  if (mc) {
    const arr = Array.isArray(mc) ? mc : [mc];
    const img = arr.find((x: any) => x?.$ ?.url || x?.url);
    const url = img?.$?.url ?? img?.url;
    if (url) return url;
  }
  // 3. media:thumbnail
  const mt = item["media:thumbnail"];
  if (mt) {
    const url = mt?.$?.url ?? mt?.url;
    if (url) return url;
  }
  // 4. img tag in content/summary
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

/** Bir RSS kaynağını çek ve kaydet */
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
    const feed = await parser.parseURL(kaynak.url);
    const db = getDb();
    const simdi = new Date();

    const hamItems = (feed.items ?? []).map((item) => {
      const baslik = temizleBaslik(item.title);
      const ozet = ozetTemizle(item.contentSnippet ?? item.summary ?? item.content);
      const resimUrl = resimBul(item);

      // Spec §2.5: Gerçek yayın tarihi — null ise NULL (fallback saat yasak)
      let yayinTarihi: string | null = null;
      if (item.pubDate) {
        const d = new Date(item.pubDate);
        if (!isNaN(d.getTime()) && d <= simdi) {
          // Gelecek tarihli haber engeli (spec §2.5)
          yayinTarihi = d.toISOString();
        }
        // Gelecek tarihli ise yayinTarihi null kalır → haber eklenmez (aşağıda filtrelenir)
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
        _pubDateRaw: item.pubDate, // gelecek tarih kontrolü için
        _isFuture: item.pubDate ? new Date(item.pubDate) > simdi : false,
      };
    });

    sonuc.toplam = hamItems.length;

    // ── EĞİTİM FİLTRESİ ────────────────────────────────────────────────
    const egitimItems = hamItems.filter((i) => {
      if (!i.baslik || !i.kaynak_url) return false;
      // Gelecek tarihli haber (spec §2.5)
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
