/**
 * RSS Kaynak Listesi — Kategorilere Göre
 *
 * Kategoriler:
 *   ilkokul   → İlköğretim (1-4. sınıf) haberleri
 *   ortaokul  → Ortaöğretim (5-8. sınıf) haberleri
 *   lise      → Lise + sınav haberleri (LGS, YKS, KPSS)
 *   avrupa    → Avrupa eğitim gündemi
 *   dunya     → Dünyadan eğitim haberleri
 *   genel     → Genel eğitim haberleri (tüm kategorilerde gösterilir)
 */

export interface RssKaynak {
  ad: string;
  url: string;
  kategori: string;
  aktif?: boolean;
  dil?: "tr" | "en";   // İngilizce kaynaklar için
}

const KAYNAKLAR: RssKaynak[] = [

  // ════════════════════════════════════════════════
  // GENEL EĞİTİM — Tüm kademeler
  // ════════════════════════════════════════════════

  {
    ad: "Hürriyet Eğitim",
    url: "https://www.hurriyet.com.tr/rss/egitim",
    kategori: "genel",
    aktif: true,
  },
  {
    ad: "Milliyet Eğitim",
    url: "https://www.milliyet.com.tr/rss/rssNew/egitimRss.xml",
    kategori: "genel",
    aktif: true,
  },
  {
    ad: "Sabah Eğitim",
    url: "https://www.sabah.com.tr/rss/egitim.xml",
    kategori: "genel",
    aktif: true,
  },
  {
    ad: "NTV Eğitim",
    url: "https://www.ntv.com.tr/egitim.rss",
    kategori: "genel",
    aktif: true,
  },
  {
    ad: "Sözcü Eğitim",
    url: "https://www.sozcu.com.tr/rss/egitim.xml",
    kategori: "genel",
    aktif: true,
  },
  {
    ad: "CNN Türk Eğitim",
    url: "https://www.cnnturk.com/feed/rss/egitim/news",
    kategori: "genel",
    aktif: true,
  },
  {
    ad: "Cumhuriyet Eğitim",
    url: "https://www.cumhuriyet.com.tr/rss/egitim",
    kategori: "genel",
    aktif: true,
  },
  // AA Güncel genel kategoriden çıkarıldı — eğitim filtresi yeterince haber bırakmıyor
  // Yalnızca 'dunya' kategorisinde aktif

  // ════════════════════════════════════════════════
  // İLK OKUL (1-4. sınıf)
  // MEB ilkokullarla ilgili haberler burada
  // ════════════════════════════════════════════════

  {
    ad: "Sabah Eğitim (İlkokul)",
    url: "https://www.sabah.com.tr/rss/egitim.xml",
    kategori: "ilkokul",
    aktif: true,
  },
  {
    ad: "Hürriyet Eğitim (İlkokul)",
    url: "https://www.hurriyet.com.tr/rss/egitim",
    kategori: "ilkokul",
    aktif: true,
  },

  // ════════════════════════════════════════════════
  // ORTA OKUL (5-8. sınıf + LGS hazırlık)
  // ════════════════════════════════════════════════

  {
    ad: "NTV Eğitim (Ortaokul)",
    url: "https://www.ntv.com.tr/egitim.rss",
    kategori: "ortaokul",
    aktif: true,
  },
  {
    ad: "Milliyet Eğitim (Ortaokul)",
    url: "https://www.milliyet.com.tr/rss/rssNew/egitimRss.xml",
    kategori: "ortaokul",
    aktif: true,
  },

  // ════════════════════════════════════════════════
  // LİSE (YKS, KPSS, LGS, ÖSYM)
  // ════════════════════════════════════════════════

  {
    ad: "Sözcü Eğitim (Lise/Sınav)",
    url: "https://www.sozcu.com.tr/rss/egitim.xml",
    kategori: "lise",
    aktif: true,
  },
  {
    ad: "CNN Türk Eğitim (Lise/Sınav)",
    url: "https://www.cnnturk.com/feed/rss/egitim/news",
    kategori: "lise",
    aktif: true,
  },
  {
    ad: "Haber7 Son Dakika (Lise)",
    url: "http://sondakika.haber7.com/sondakika.rss",
    kategori: "lise",
    aktif: false,  // Genel haber RSS — eğitim filtresi yeterince haber bırakmıyor
  },

  // ════════════════════════════════════════════════
  // AVRUPA EĞİTİM GÜNDEMİ
  // Türkçe + İngilizce uluslararası kaynaklar
  // ════════════════════════════════════════════════

  {
    ad: "DW Türkçe",
    url: "https://rss.dw.com/xml/rss-tur-all",
    kategori: "avrupa",
    aktif: true,
    dil: "tr",
  },
  {
    ad: "Euronews Türkçe",
    url: "https://tr.euronews.com/rss",
    kategori: "avrupa",
    aktif: false,  // gzip sıkıştırma sorunu — rss-parser çözemiyor
    dil: "tr",
  },
  {
    ad: "BBC Education",
    url: "https://feeds.bbci.co.uk/news/education/rss.xml",
    kategori: "avrupa",
    aktif: true,
    dil: "en",
  },

  // ════════════════════════════════════════════════
  // DÜNYADAN EĞİTİM HABERLERİ
  // ════════════════════════════════════════════════

  {
    ad: "The Guardian Education",
    url: "https://www.theguardian.com/education/rss",
    kategori: "dunya",
    aktif: true,
    dil: "en",
  },
  {
    ad: "DW Türkçe (Dünya)",
    url: "https://rss.dw.com/xml/rss-tur-all",
    kategori: "dunya",
    aktif: true,
    dil: "tr",
  },
  {
    ad: "AA Güncel (Dünya)",
    url: "https://www.aa.com.tr/tr/rss/default?cat=guncel",
    kategori: "dunya",
    aktif: false,  // Çok genel haberler — eğitim filtresiyle bile kirlilik yaratıyor
    dil: "tr",
  },

];

// Yalnızca aktif kaynakları dışa aktar
export default KAYNAKLAR.filter((k) => k.aktif !== false);
