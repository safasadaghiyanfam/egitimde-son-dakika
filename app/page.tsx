import type { Metadata } from "next";
import { sonHaberler, haberSayisi, gunVeSaatGruplari, saatString, istanbulFormat, type GunGrubu } from "../lib/queries";
import type { Haber } from "../lib/db";

export const metadata: Metadata = {
  title: "Eğitimde Son Dakika | Ana Sayfa",
  description: "Türkiye eğitim gündeminden son dakika haberleri: MEB, ÖSYM, YÖK, YKS, LGS, KPSS.",
};

// Her istekte taze veri
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ─────────────────────────────────────────────
   ALT BİLEŞENLER
   ───────────────────────────────────────────── */

/** Son Dakika Akışı — Gün + Saat gruplu */
function SonDakikaAkisi({ gunGruplari }: { gunGruplari: GunGrubu[] }) {
  if (gunGruplari.length === 0) {
    return (
      <div className="son-dakika__bos">
        <p>Haber yükleniyor, lütfen bekleyin.</p>
      </div>
    );
  }

  return (
    <>
      {gunGruplari.map((gun) => (
        <div key={gun.gunEtiketi}>
          {/* Gün ayıracı */}
          <div className="sd-item sd-item--day-separator">
            <span className="sd-item__day">{gun.gunEtiketi}</span>
          </div>
          {gun.saatGruplari.map((grup) => (
            <div key={grup.saat}>
              {/* Saat ayıracı */}
              <div className="sd-item sd-item--separator">
                <span className="sd-item__time sd-item__time--separator">{grup.saat}</span>
              </div>
              {grup.haberler.map((h) => {
                const saat = saatString(h);
                return (
                  <div key={h.id} className="sd-item">
                    {saat && (
                      <span className="sd-item__time">{saat}</span>
                    )}
                    <a href={`/haber/${h.id}`} className="sd-item__title">
                      {h.baslik}
                    </a>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

/** Manşet — DB'den ilk haber; yoksa hiçbir şey render etme */
function Manshet({ haber }: { haber: Haber | null }) {
  if (!haber) {
    return (
      <article aria-label="Manşet haber">
        <div className="manshet__bos">
          <p>Manşet haber bekleniyor…</p>
        </div>
      </article>
    );
  }

  const tarihStr = istanbulFormat(haber.yayin_tarihi ?? haber.eklenme_tarihi, {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <article aria-label="Manşet haber">
      <div className="manshet__overline">
        Manşet · {haber.kaynak_adi}
      </div>
      <a href={`/haber/${haber.id}`} style={{ display: "block" }}>
        <h1 className="manshet__title">{haber.baslik}</h1>
      </a>
      {haber.ozet && <p className="manshet__lead">{haber.ozet}</p>}

      {/* Görsel — yoksa placeholder metin yok (spec §3.A) */}
      {haber.resim_url && (
        <div className="manshet__img-wrap">
          <img
            src={haber.resim_url}
            alt={haber.baslik}
            className="manshet__img"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      )}

      <p className="manshet__caption">
        {/* Spec §2.4: Türkçe toLocaleUpperCase — İ/I doğru */}
        KAYNAK: {haber.kaynak_adi.toLocaleUpperCase("tr-TR")} · {tarihStr}
      </p>
    </article>
  );
}

/* ─────────────────────────────────────────────
   ANA SAYFA
   ───────────────────────────────────────────── */
export default async function AnaSayfa() {
  let haberler: Haber[] = [];
  let toplamSayi = 0;
  try {
    haberler = await sonHaberler(80);
    toplamSayi = await haberSayisi();
  } catch (e) {
    console.error("[page] DB hatası:", e);
  }

  const gunGruplari = gunVeSaatGruplari(haberler.slice(0, 40));
  const manshetHaber = haberler[0] ?? null;

  // Kısa Kısa: 2–4. haberler — sadece gerçek DB verisi (spec §3: mockup yok)
  const kisaHaberler = haberler.slice(1, 4);

  // Öne Çıkanlar: 5–8. haberler
  const oneCikanlar = haberler.slice(4, 8);

  return (
    <>
      {/* ══════════════════════════════════════
          3 SÜTUN ANA BÖLÜM
          ══════════════════════════════════════ */}
      <div className="three-col-grid">

        {/* ── SOL: KISA KISA ── */}
        <aside aria-label="Kısa haberler">
          <div className="kisa-kisa__title">Kısa Kısa</div>
          {kisaHaberler.length === 0 ? (
            <p style={{ padding: "12px", color: "#666", fontSize: "14px" }}>
              Haberler yükleniyor…
            </p>
          ) : (
            kisaHaberler.map((h) => (
              <div key={h.id} className="kisa-item">
                <div className="kisa-item__cat">
                  {h.kaynak_adi.toLocaleUpperCase("tr-TR")}
                </div>
                <a
                  href={`/haber/${h.id}`}
                  className="kisa-item__title"
                  style={{
                    display: "block",
                    fontFamily: "'Libre Caslon Display', Georgia, serif",
                    fontSize: "17px",
                    lineHeight: "1.22",
                    fontWeight: 400,
                    marginBottom: "6px",
                    textWrap: "pretty",
                  }}
                >
                  {h.baslik}
                </a>
                {h.ozet && <p className="kisa-item__desc">{h.ozet}</p>}
              </div>
            ))
          )}
        </aside>

        {/* ── ORTA: MANŞET ── */}
        <Manshet haber={manshetHaber} />

        {/* ── SAĞ: SON DAKİKA AKIŞI ── */}
        <aside aria-label="Son dakika akışı">
          <div className="son-dakika__header">
            <span className="son-dakika__badge">Son Dakika Akışı</span>
            {/* Spec §3.A: gerçek sayaç */}
            <span className="son-dakika__count">{toplamSayi} haber</span>
            {/* "Tümü →" linki — sayfalama henüz yok, kaldırıldı */}
          </div>
          <SonDakikaAkisi gunGruplari={gunGruplari} />
        </aside>

      </div>

      {/* ══════════════════════════════════════
          ÖNE ÇIKANLAR — sadece gerçek DB verisi
          ══════════════════════════════════════ */}
      {oneCikanlar.length > 0 && (
        <section className="one-cikanlar" aria-label="Öne çıkan haberler">
          <div className="one-cikanlar__header">Öne Çıkanlar</div>
          <div className="one-cikanlar__grid">
            {oneCikanlar.map((h) => (
              <div key={h.id} className="one-card">
                {/* Görsel — yoksa kart metin-only (spec §3.A) */}
                {h.resim_url && (
                  <div className="one-card__img">
                    <img
                      src={h.resim_url}
                      alt={h.baslik}
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </div>
                )}
                <div className="one-card__cat">
                  {h.kaynak_adi.toLocaleUpperCase("tr-TR")}
                </div>
                <a
                  href={`/haber/${h.id}`}
                  className="one-card__title"
                  style={{
                    display: "block",
                    fontFamily: "'Libre Caslon Display', Georgia, serif",
                    fontSize: "19px",
                    lineHeight: "1.22",
                    fontWeight: 400,
                    marginBottom: "6px",
                    textWrap: "pretty",
                  }}
                >
                  {h.baslik}
                </a>
                {h.ozet && <p className="one-card__desc">{h.ozet}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          DAHA FAZLA HABER
          ══════════════════════════════════════ */}
      {haberler.length > 8 && (
        <section className="daha-fazla" aria-label="Daha fazla haber">
          <div className="wrap">
            <div className="daha-fazla__header">Tüm Haberler</div>
            <div className="daha-fazla__liste">
              {haberler.slice(8).map((h) => {
                const saat = saatString(h);
                return (
                  <a key={h.id} href={`/haber/${h.id}`} className="daha-fazla__item">
                    <span className="daha-fazla__kaynak">
                      {h.kaynak_adi.toLocaleUpperCase("tr-TR")}
                    </span>
                    <span className="daha-fazla__baslik">{h.baslik}</span>
                    {saat && (
                      <span className="daha-fazla__saat">{saat}</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
