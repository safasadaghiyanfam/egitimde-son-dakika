/**
 * RSS Kaynak Listesi — Spec §1.2 gereği yalnızca 5 kaynak
 *
 * Kaynaklar:
 *   Son Dakika (sondakika.com)
 *   İHA — İhlas Haber Ajansı (iha.com.tr)
 *   Anadolu Ajansı / AA (aa.com.tr)
 *   YÖK — çekilemezse TRT Haber (trthaber.com) [YOK_FALLBACK=true]
 *   MEB (meb.gov.tr)   — çekilemezse TRT Haber  [MEB_FALLBACK=true]
 *
 * Kapsam Dışı (spec §4):
 *   Hürriyet, Milliyet, Sabah, NTV, Sözcü, CNN Türk, Cumhuriyet,
 *   DW, BBC, Guardian — hiçbiri kullanılmaz.
 */

export interface RssKaynak {
  ad: string;
  url: string;
  kategori: string;
  aktif?: boolean;
  dil?: "tr" | "en";
  /** true ise bu kaynak YÖK/MEB erişilemediğinde devreye giren fallback'tir */
  isFallback?: boolean;
  /** Bu kaynak geçersiz olduğunda hangi fallback kaynağı kullanılacak */
  fallbackFor?: string;
}

const KAYNAKLAR: RssKaynak[] = [

  // ════════════════════════════════════════════════
  // ANADOLU AJANSI (AA)
  // Eğitim kategorisi RSS — doğrudan çalışıyor
  // ════════════════════════════════════════════════
  {
    ad: "Anadolu Ajansı",
    url: "https://www.aa.com.tr/tr/rss/default?cat=egitim",
    kategori: "genel",
    aktif: true,
    dil: "tr",
  },

  // ════════════════════════════════════════════════
  // İHA — İHLAS HABER AJANSI
  // Genel RSS (eğitim kategorisi Cloudflare koruması)
  // Eğitim filtresi rss.ts'de uygulanır
  // ════════════════════════════════════════════════
  {
    ad: "İHA",
    url: "https://www.iha.com.tr/rss/",
    kategori: "genel",
    aktif: true,
    dil: "tr",
  },

  // ════════════════════════════════════════════════
  // SON DAKİKA (sondakika.com)
  // Genel RSS (eğitim kategorisi RSS'i 404)
  // Eğitim filtresi rss.ts'de uygulanır
  // ════════════════════════════════════════════════
  {
    ad: "Son Dakika",
    url: "https://www.sondakika.com/rss.xml",
    kategori: "genel",
    aktif: true,
    dil: "tr",
  },

  // ════════════════════════════════════════════════
  // TRT HABER
  // Spec §1.2: YÖK çekilemezse + MEB çekilemezse TRT Haber kullanılır
  // Genel son dakika RSS, eğitim filtresiyle taranır
  // ════════════════════════════════════════════════
  {
    ad: "TRT Haber",
    url: "https://www.trthaber.com/sondakika.rss",
    kategori: "genel",
    aktif: true,
    dil: "tr",
    isFallback: true,           // YÖK ve MEB için fallback
    fallbackFor: "YÖK / MEB",
  },

  // ════════════════════════════════════════════════
  // MEB (Millî Eğitim Bakanlığı)
  // RSS endpoint erişilemez durumda; TRT Haber fallback devrede
  // Doğrudan RSS bulunursa aktif=true yapılabilir
  // ════════════════════════════════════════════════
  // {
  //   ad: "MEB",
  //   url: "https://www.meb.gov.tr/haberler/rss_haberler.php",
  //   kategori: "genel",
  //   aktif: false,   // 404 — TRT Haber fallback aktif
  //   dil: "tr",
  // },

];

// Yalnızca aktif kaynakları dışa aktar
export default KAYNAKLAR.filter((k) => k.aktif !== false);
