/**
 * lib/rss.ts
 * Tek bir RSS kaynağını çeker, ayrıştırır ve DB'ye kaydeder.
 * Eğitimle alakasız haberler anahtar kelime filtresiyle elenir.
 */

import Parser from "rss-parser";
import { getDb } from "./db";
import { haberHash } from "./dedupe";
import type { RssKaynak } from "../data/kaynaklar";

const parser = new Parser({
  timeout: 10_000,
  headers: {
    "User-Agent":
      "EgitimSonDakika/1.0 (https://egitimde.com; RSS reader)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

/* ─────────────────────────────────────────────────────────────
   EĞİTİM ANAHTAR KELİMELERİ
   Türkçe + İngilizce (BBC/Guardian gibi kaynaklar için)
   ───────────────────────────────────────────────────────────── */
const EGITIM_TR = [
  "eğitim", "egitim", "okul", "öğrenci", "ogrenci", "öğretmen", "ogretmen",
  "üniversite", "universite", "sınav", "sinav", "müfredat", "mufredat",
  "meb", "ösym", "osym", "yök", "yok", "yks", "lgs", "kpss", "tyt", "ayt",
  "ders", "burs", "yurt", "atama", "kadro", "tayin",
  "lise", "ilkokul", "ortaokul", "anaokulu", "kreş", "kres",
  "akademi", "fakülte", "fakulte", "bölüm", "bolum", "enstitü", "enstitu",
  "lisans", "doktora", "mezun", "ödev", "odev", "sınıf", "sinif",
  "kontenjan", "yerleştirme", "yerlestirme", "kayıt", "kayit",
  "özel okul", "ozel okul", "devlet okulu", "yatılı", "yatili",
  "öğrenim", "ogrenim", "pedagoji", "eğitimci", "egitimci",
  "kampüs", "kampus", "rektör", "rektor", "dekan",
  "ücret", "ucret", "harç", "harc", "bütçe", "butce",
  "öğrenci evi", "öğrenci yurdu",
];

const EGITIM_EN = [
  "education", "school", "university", "student", "teacher", "exam",
  "curriculum", "degree", "learning", "pupil", "college", "academic",
  "classroom", "textbook", "tuition", "scholarship", "graduation",
  "headteacher", "headmaster", "ofsted", "gcse", "a-level", "lecture",
  "campus", "faculty", "kindergarten", "nursery", "literacy", "numeracy",
];

const TUM_KELIMELER = [...EGITIM_TR, ...EGITIM_EN];

/**
 * Başlık ve özette en az bir eğitim anahtar kelimesi var mı?
 * Artık tüm kaynaklar içerik kontrolünden geçer.
 * Spor / magazin / siyaset kara listesi ile yanlış geçişler engellenir.
 */

/* Kara liste: Bu kelimeler başlıkta geçiyorsa haber ELENİR */
const KARA_LISTE = [
  // Spor
  "fenerbahçe", "galatasaray", "beşiktaş", "trabzonspor", "kayserispor",
  "bursaspor", "sivasspor", "antalyaspor", "rizespor",
  "transfer ", "teknik direktör", "şampiyonlar ligi", "süper lig",
  "play-off", "play off", "maç özeti", "gol ", "penaltı", "hakeml",
  "futbol", "basketbol", "voleybol", "tenis", "golf",
  // Finans / Ekonomi
  "borsa", "dolar", "euro ", "altın fiyat", "petrol fiyat",
  "enflasyon", "faiz oranı", "merkez bankası", "bütçe açığı",
  "kur ", " kur", "kripto", "bitcoin", "ethereum",
  // Magazin / Eğlence
  "dizisi", " dizi ", "fragman", "bölüm izle", "oyuncu", "aktris", "aktör",
  "şarkıcı", "konser", "albüm", "müzik video",
  // Siyaset
  "cumhurbaşkanı erdoğan", "ak parti", "chp genel", "mhp genel",
  "hdp", "iyip", "seçim", "oy oranı", "sandık",
];

function egitimHaberiMi(
  baslik: string,
  ozet: string | null,
): boolean {
  const baslikKucuk = baslik.toLowerCase();

  // Kara listede varsa direkt eleme
  if (KARA_LISTE.some((kw) => baslikKucuk.includes(kw))) return false;

  const metin = `${baslik} ${ozet ?? ""}`.toLowerCase();
  return TUM_KELIMELER.some((kw) => metin.includes(kw));
}

/** Özeti temizle: HTML etiketlerini kaldır, 280 karakterle kes */
function ozetTemizle(raw: string | undefined): string | null {
  if (!raw) return null;
  const text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 280 ? text.slice(0, 277) + "…" : text || null;
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

    const insert = db.prepare(`
      INSERT OR IGNORE INTO haberler
        (baslik, ozet, kaynak_url, kaynak_adi, kategori, yayin_tarihi, hash)
      VALUES
        (@baslik, @ozet, @kaynak_url, @kaynak_adi, @kategori, @yayin_tarihi, @hash)
    `);

    const insertMany = db.transaction((items: Parameters<typeof insert.run>[0][]) => {
      let eklenen = 0;
      for (const item of items) {
        const result = insert.run(item);
        if (result.changes > 0) eklenen++;
      }
      return eklenen;
    });

    const hamItems = (feed.items ?? []).map((item) => {
      const ozet = ozetTemizle(item.contentSnippet ?? item.summary ?? item.content);
      return {
        baslik: (item.title ?? "").trim(),
        ozet,
        kaynak_url: item.link ?? item.guid ?? "",
        kaynak_adi: kaynak.ad,
        kategori: kaynak.kategori,
        yayin_tarihi: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : null,
        hash: haberHash(item.title ?? ""),
      };
    });

    sonuc.toplam = hamItems.length;

    // ── EĞİTİM FİLTRESİ ────────────────────────────────────────────────
    const egitimItems = hamItems.filter((i) => {
      if (!i.baslik || !i.kaynak_url) return false;
      const gecti = egitimHaberiMi(i.baslik, i.ozet);
      if (!gecti) sonuc.filtrelenen++;
      return gecti;
    });

    sonuc.eklenen = insertMany(egitimItems);
    sonuc.atlanan = egitimItems.length - sonuc.eklenen;
  } catch (err: unknown) {
    sonuc.hata = err instanceof Error ? err.message : String(err);
  }

  return sonuc;
}
