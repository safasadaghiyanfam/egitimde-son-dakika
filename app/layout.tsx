import type { Metadata } from "next";
import "./globals.css";
import DateBar from "./components/DateBar";

export const metadata: Metadata = {
  title: {
    default: "Eğitimde Son Dakika | MEB, ÖSYM, YÖK, Sınav Haberleri",
    template: "%s | Eğitimde Son Dakika",
  },
  description:
    "Türkiye'nin eğitim gündemi: MEB duyuruları, ÖSYM sınav takvimi, YÖK haberleri, YKS, LGS, KPSS ve öğretmen atama son dakika bilgileri.",
  keywords: ["MEB", "ÖSYM", "YÖK", "YKS", "LGS", "KPSS", "eğitim haberleri", "öğretmen atama"],
  openGraph: { siteName: "Eğitimde Son Dakika", locale: "tr_TR", type: "website" },
};

/* ─────────────────────────────────────────────
   FİNANSAL VERİLER (İleride API'den gelecek)
   ───────────────────────────────────────────── */
const MARKETS = [
  { label: "DOLAR",   price: "40,3812", change: "↑ 0,18",  dir: "up" },
  { label: "EURO",    price: "47,1248", change: "↓ 0,27",  dir: "down" },
  { label: "GRAM ALTIN", price: "4.318,60", change: "↑ 3,84", dir: "up" },
  { label: "BİST 100",  price: "11.742,08", change: "↑ 31,12", dir: "up" },
  { label: "BİTCOİN",  price: "$119.840", change: "↓ 51,64", dir: "down" },
  { label: "GRAM GÜMÜŞ", price: "42,16", change: "↑ 0,52", dir: "up" },
] as const;

const MARKETS_DOUBLED = [...MARKETS, ...MARKETS];

/* ─────────────────────────────────────────────
   SON DAKİKA HABERLERİ (İleride RSS'den gelecek)
   ───────────────────────────────────────────── */
const BREAKING_ITEMS = [
  "TERCİH BAŞVURULARI 12 AĞUSTOS'A AÇILIYOR",
  "ÖSYM: YKS EK YERLEŞTİRME KILAVUZU YAYIMLANDI",
  "ÖĞRETMEN ATAMA KONTENJANI 25 BİNE YÜKSELDİ",
  "LGS SONUÇLARI AÇIKLANDI — SORGULAMA BAŞLADI",
  "YÖK: YÜKSEKÖĞRETİM KAYIT TAKVİMİ BELLİ OLDU",
];

const BREAKING_DOUBLED = [...BREAKING_ITEMS, ...BREAKING_ITEMS];

/* ─────────────────────────────────────────────
   ANA NAVİGASYON
   ───────────────────────────────────────────── */
const NAV = [
  { label: "Gündem",                    href: "/" },
  { label: "İlk Okul",                  href: "/kategori/ilkokul" },
  { label: "Orta Okul",                 href: "/kategori/ortaokul" },
  { label: "Lise",                      href: "/kategori/lise" },
  { label: "Avrupa Eğitim Gündemi",     href: "/kategori/avrupa" },
  { label: "Dünyadan Eğitim Haberleri", href: "/kategori/dunya" },
] as const;

/* ─────────────────────────────────────────────
   GÜNDEM ETİKETLERİ
   ───────────────────────────────────────────── */
const TRENDS = [
  "#İlkokul", "#Ortaokul", "#Lise", "#AvrupaEğitim",
  "#DünyaEğitim", "#MEB", "#ÖSYM", "#SınavTakvimi",
];

/* ─────────────────────────────────────────────
   LAYOUT BİLEŞENİ
   ───────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const year = now.getFullYear();

  return (
    <html lang="tr">
      <body>

        {/* ── 1. FİNANSAL TICKER ── */}
        <div className="markets-bar" role="marquee" aria-label="Piyasa verileri">
          <div className="markets-bar__track" aria-hidden="true">
            <div className="markets-bar__inner">
              {MARKETS_DOUBLED.map((m, i) => (
                <span key={i} className="market-item">
                  <span className="market-item__label">{m.label}</span>
                  <span className="market-item__price">{m.price}</span>
                  <span className={`market-item__change ${m.dir}`}>{m.change}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2. TARİH / KONUM / SAAT ÇUBUĞU ── */}
        <DateBar />

        {/* ── 3. LOGO (orijinal HTML birebir) ── */}
        <header className="masthead" role="banner">
          <div className="masthead__inner">
            {/* Üst çift çizgi */}
            <div className="masthead__rule-thick" />
            {/* Logo: mix-blend-mode:multiply + margin:-7% 0 */}
            <div className="masthead__rule-thin">
              <a href="/" aria-label="Ana sayfaya git">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Eğitimde Son Dakika — Doğru Bilgi, Hızlı Duyuru"
                  className="masthead__logo-img"
                />
              </a>
            </div>
            {/* Alt çizgiler */}
            <div className="masthead__rule-bottom" />
            <div className="masthead__rule-bottom2" />
            {/* Alt yazı */}
            <div className="masthead__subline">
              Doğru Bilgi, Hızlı Duyuru
            </div>
          </div>
        </header>


        {/* ── 4. SON DAKİKA BANDI ── */}
        <div className="breaking-band" role="marquee" aria-label="Son dakika haberleri">
          <div className="breaking-band__label" aria-hidden="true">
            <span>◆</span> Son Dakika
          </div>
          <div className="breaking-band__track" aria-hidden="true">
            <div className="breaking-band__inner">
              {BREAKING_DOUBLED.map((item, i) => (
                <span key={i} className="breaking-item">
                  {item}
                  <span className="breaking-sep">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. ANA NAVİGASYON ── */}
        <nav className="main-nav" aria-label="Ana menü">
          <div className="wrap">
            <div className="main-nav__inner">
              {NAV.map((item) => (
                <a key={item.label} href={item.href} className="main-nav__link">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* ── 6. GÜNDEM ETİKETLERİ ── */}
        <div className="trends-bar" aria-label="Gündem etiketleri">
          <div className="wrap">
            <div className="trends-bar__inner">
              <span className="trends-bar__label">Gündemdekiler</span>
              {TRENDS.map((tag) => (
                <a key={tag} href="#" className="trend-tag">{tag}</a>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. ANA İÇERİK ── */}
        <main className="page-content" id="main-content">
          {children}
        </main>

        {/* ── 8. FOOTER ── */}
        <footer className="site-footer" role="contentinfo">
          <div className="wrap">
            <div className="site-footer__main">
              <span className="site-footer__brand">Eğitimde Son Dakika</span>
              <nav className="site-footer__links" aria-label="Alt menü">
                {["Künye", "İletişim", "Yayın İlkeleri", "Gizlilik", "RSS", "Bülten"].map((l) => (
                  <a key={l} href="#">{l}</a>
                ))}
              </nav>
            </div>
            <div className="site-footer__copy">
              © {year} Eğitimde Son Dakika · Doğru Bilgi, Hızlı Duyuru · Tüm hakları saklıdır
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
