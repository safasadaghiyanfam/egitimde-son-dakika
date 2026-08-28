import type { Metadata } from "next";
import "./globals.css";
import DateBar from "./components/DateBar";
import BreakingBand from "./components/BreakingBand";

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
   ANA NAVİGASYON (Baştan Profesyonel İsimlendirme)
   ───────────────────────────────────────────── */
const NAV = [
  { label: "Gündem",           href: "/" },
  { label: "MEB",              href: "/kategori/meb" },
  { label: "ÖSYM & Sınavlar",  href: "/kategori/osym" },
  { label: "YÖK & Üniversite", href: "/kategori/yok" },
  { label: "Okullar & LGS",    href: "/kategori/okullar" },
  { label: "Dünya & Avrupa",   href: "/kategori/dunya" },
] as const;


/* ─────────────────────────────────────────────
   LAYOUT BİLEŞENİ
   ───────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const year = now.getFullYear();

  return (
    <html lang="tr">
      <body>

        {/* ── 1. FİNANSAL TICKER — KALDIRILDI (Spec §3.A, §4) ── */}
        {/* Döviz/borsa verisi eğitimle ilgisiz ve mockup olduğu için kaldırıldı */}

        {/* ── 2. TARİH / KONUM / SAAT ÇUBUĞU ── */}
        <DateBar />

        {/* ── 3. LOGO ── */}
        <header className="masthead" role="banner">
          <div className="masthead__inner">
            <div className="masthead__rule-thick" />
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
            <div className="masthead__rule-bottom" />
            <div className="masthead__rule-bottom2" />
            <div className="masthead__subline">
              Doğru Bilgi, Hızlı Duyuru
            </div>
          </div>
        </header>

        {/* ── 4. SON DAKİKA BANDI — gerçek DB verisi (Spec §3.A) ── */}
        <BreakingBand />

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


        {/* ── 7. ANA İÇERİK ── */}
        <main className="page-content" id="main-content">
          {children}
        </main>

        {/* ── 8. FOOTER — Spec §3.A: gerçek sayfalar ── */}
        <footer className="site-footer" role="contentinfo">
          <div className="wrap">
            <div className="site-footer__main">
              <span className="site-footer__brand">Eğitimde Son Dakika</span>
              <nav className="site-footer__links" aria-label="Alt menü">
                <a href="/iletisim">İletişim</a>
                <a href="/gizlilik">Gizlilik Politikası</a>
                {/* Künye, Yayın İlkeleri, RSS, Bülten: henüz hazır sayfa yok — kaldırıldı */}
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
