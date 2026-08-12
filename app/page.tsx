import type { Metadata } from "next";
import { sonHaberler, saatGruplari, haberSayisi, type SaatGrubu } from "../lib/queries";
import type { Haber } from "../lib/db";

export const metadata: Metadata = {
  title: "Eğitimde Son Dakika | Ana Sayfa",
};

// Her istekte taze veri — SSR (static cache yok)
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ─────────────────────────────────────────────
   PLACEHOLDER VERİLER (DB boşken gösterilir)
   ───────────────────────────────────────────── */
const KISA_HABERLER_PLACEHOLDER = [
  {
    id: "kk1",
    kategori: "Yükseköğretim",
    baslik: "Üniversitelerde yeni dönem kayıt ücretlerine tavan sınırı geldi",
    ozet: "YÖK'ün genelgesine göre ikinci öğretim ücretleri enflasyonun yarısı oranında artırılabilecek.",
    kaynak_url: "#",
  },
  {
    id: "kk2",
    kategori: "Öğretmen",
    baslik: "Sözleşmeli öğretmenlikte kadro takvimi netleşti",
    ozet: "Üç yılını dolduran 41 bin öğretmenin kadro geçişi eylül ayında tamamlanacak.",
    kaynak_url: "#",
  },
  {
    id: "kk3",
    kategori: "Sınav",
    baslik: "AÖF sınav merkezleri listesi güncellendi",
    ozet: "Yurt dışında dört yeni merkez açıldı; başvuru değişikliği 20 Ağustos'a kadar yapılabilecek.",
    kaynak_url: "#",
  },
];

const ONE_CIKANLAR_PLACEHOLDER = [
  { id: "f1", kategori: "Teknoloji", baslik: "Yapay zekâ destekli ölçme sistemi 400 okulda pilot uygulamada", ozet: "Sistem, öğrencinin konu bazlı eksiğini haftalık raporluyor.", kaynak_url: "#" },
  { id: "f2", kategori: "Dünya",     baslik: "Finlandiya okullarda telefon yasağını kalıcı hâle getirdi", ozet: "İlk yıl raporu: derse katılımda yüzde 9 artış.", kaynak_url: "#" },
  { id: "f3", kategori: "Yaşam",    baslik: "Okul çantası ağırlığı için yeni standart yolda", ozet: "Vücut ağırlığının yüzde 10'u sınırı zorunlu olacak.", kaynak_url: "#" },
  { id: "f4", kategori: "Sağlık",   baslik: "Okul kantinlerinde şeker sınırı denetimleri sıkılaşıyor", ozet: "Bakanlık, ihlalde sözleşme feshi uygulanacağını bildirdi.", kaynak_url: "#" },
];

/* ─────────────────────────────────────────────
   ALT BİLEŞENLER
   ───────────────────────────────────────────── */

/** Son Dakika Akışı — DB'den gelen saate göre gruplu haberler */
function SonDakikaAkisi({ gruplar }: { gruplar: SaatGrubu[] }) {
  if (gruplar.length === 0) {
    return (
      <div className="son-dakika__bos">
        <p>Henüz haber yok. <a href="/api/fetch" className="link-red">RSS çek →</a></p>
      </div>
    );
  }

  return (
    <>
      {gruplar.map((grup) => (
        <div key={grup.saat}>
          {/* Saat ayracı */}
          <div className="sd-item sd-item--separator">
            <span className="sd-item__time sd-item__time--separator">{grup.saat}</span>
          </div>
          {grup.haberler.map((h) => (
            <div key={h.id} className="sd-item">
              <span className="sd-item__time">
                {new Date(h.yayin_tarihi ?? h.eklenme_tarihi).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <a
                href={`/haber/${h.id}`}
                className="sd-item__title"
              >
                {h.baslik}
              </a>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

/** Manşet — DB'den ilk haber veya placeholder */
function Manshet({ haber }: { haber: Haber | null }) {
  const baslik = haber?.baslik ?? "LGS tercih takvimi açıklandı: Başvurular 12 Ağustos'ta başlıyor";
  const ozet = haber?.ozet ?? "Bakanlık, 1 milyon 187 bin öğrenciyi ilgilendiren yerleştirme sürecinde tercih sayısını 25'e çıkardı. Nakil dönemleri de yeniden düzenlendi.";
  const url = haber?.kaynak_url ?? "#";
  const kaynakAdi = haber?.kaynak_adi ?? "Millî Eğitim Bakanlığı";

  return (
    <article aria-label="Manşet haber">
      <div className="manshet__overline">Manşet · {kaynakAdi}</div>
      <a href={haber ? `/haber/${haber.id}` : url} style={{ display: "block" }}>
        <h1 className="manshet__title">{baslik}</h1>
      </a>
      {ozet && <p className="manshet__lead">{ozet}</p>}

      <div className="manshet__img-wrap">
        <div className="img-placeholder">Manşet görseli — 16:9</div>
      </div>
      <p className="manshet__caption">
        {haber
          ? `KAYNAK: ${haber.kaynak_adi.toUpperCase()} · ${new Date(haber.yayin_tarihi ?? haber.eklenme_tarihi).toLocaleString("tr-TR")}`
          : "FOTOĞRAF: EĞİTİMDE SON DAKİKA ARŞİVİ"}
      </p>

      {!haber && (
        <>
          <div className="manshet__byline">
            Elif Karaduman &nbsp;·&nbsp; Ankara &nbsp;·&nbsp; 7 Ağustos 2026, 23:14
          </div>
          <div className="manshet__body">
            <p>
              Millî Eğitim Bakanlığı, merkezi sınavla öğrenci alan okullara
              yerleştirme takvimini yayımladı. Buna göre tercih başvuruları 12 Ağustos
              sabahı e-Okul üzerinden açılacak ve 19 Ağustos akşamı sona erecek.
            </p>
            <p>
              Yeni düzenlemeyle öğrenciler en fazla 25 okul tercih edebilecek; önceki
              yıl bu sayı 15 ile sınırlıydı. Bakanlık, kontenjan dışı kalan öğrenci
              oranını düşürmeyi hedeflediklerini bildirdi.
            </p>
            <p>
              Yerleştirme sonuçları 26 Ağustos&apos;ta açıklanacak. Nakil süreci üç
              dönem hâlinde yürütülecek: 28 Ağustos, 4 Eylül ve 11 Eylül.
            </p>
          </div>
        </>
      )}
    </article>
  );
}

/* ─────────────────────────────────────────────
   ANA SAYFA
   ───────────────────────────────────────────── */
export default function AnaSayfa() {
  // DB'den haberler
  const haberler = sonHaberler(120);
  const toplamSayi = haberSayisi();
  const gruplar = saatGruplari(haberler.slice(0, 40));  // Sağ akış için ilk 40

  // Manşet = en yeni haber
  const manshetHaber = haberler[0] ?? null;

  // Kısa Kısa = 2-4. haberler
  const kisaHaberler = haberler.length > 1
    ? haberler.slice(1, 4).map((h) => ({
        id: String(h.id),
        kategori: h.kaynak_adi,          // kaynak adı göster ("Hürriyet Eğitim" vb.)
        baslik: h.baslik,
        ozet: h.ozet ?? "",
        kaynak_url: h.kaynak_url,
        kaynak_adi: h.kaynak_adi,
      }))
    : KISA_HABERLER_PLACEHOLDER;

  // Öne Çıkanlar = 5-8. haberler
  const oneCikanlar = haberler.length > 4
    ? haberler.slice(4, 8).map((h) => ({
        id: String(h.id),
        kategori: h.kaynak_adi,
        baslik: h.baslik,
        ozet: h.ozet ?? "",
        kaynak_url: h.kaynak_url,
      }))
    : ONE_CIKANLAR_PLACEHOLDER;

  return (
    <>
      {/* ── DB durumu (geliştirme için) ── */}
      {toplamSayi === 0 && (
        <div className="db-empty-banner">
          <div className="wrap">
            <strong>⚡ Veritabanı boş.</strong>{" "}
            <a href="/api/fetch" className="link-red">
              Haberleri şimdi çek →
            </a>{" "}
            veya terminalde:{" "}
            <code>npm run fetch</code>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          3 SÜTUN ANA BÖLÜM
          ══════════════════════════════════════ */}
      <div className="three-col-grid">

        {/* ── SOL: KISA KISA ── */}
        <aside aria-label="Kısa haberler">
          <div className="kisa-kisa__title">Kısa Kısa</div>
          {kisaHaberler.map((h) => (
            <div key={h.id} className="kisa-item">
              <div className="kisa-item__cat">{h.kategori}</div>
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
          ))}
        </aside>

        {/* ── ORTA: MANŞET ── */}
        <Manshet haber={manshetHaber} />

        {/* ── SAĞ: SON DAKİKA AKIŞI ── */}
        <aside aria-label="Son dakika akışı">
          <div className="son-dakika__header">
            <span className="son-dakika__badge">Son Dakika Akışı</span>
            <span className="son-dakika__count">{toplamSayi} haber</span>
            <a href="#" className="son-dakika__more">Tümü →</a>
          </div>
          <SonDakikaAkisi gruplar={gruplar} />
        </aside>

      </div>

      {/* ══════════════════════════════════════
          ÖNE ÇIKANLAR
          ══════════════════════════════════════ */}
      <section className="one-cikanlar" aria-label="Öne çıkan haberler">
        <div className="one-cikanlar__header">Öne Çıkanlar</div>
        <div className="one-cikanlar__grid">
          {oneCikanlar.map((card) => (
            <div key={card.id} className="one-card">
              <div className="one-card__img">
                <div className="img-placeholder">Görsel</div>
              </div>
              <div className="one-card__cat">{card.kategori}</div>
              <a
                href={`/haber/${card.id}`}
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
                {card.baslik}
              </a>
              {card.ozet && <p className="one-card__desc">{card.ozet}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          DAHA FAZLA HABER (DB'den gelen geri kalanlar)
          ══════════════════════════════════════ */}
      {haberler.length > 8 && (
        <section className="daha-fazla" aria-label="Daha fazla haber">
          <div className="wrap">
            <div className="daha-fazla__header">Tüm Haberler</div>
            <div className="daha-fazla__liste">
              {haberler.slice(8).map((h) => (
                <a
                  key={h.id}
                  href={`/haber/${h.id}`}
                  className="daha-fazla__item"
                >
                  <span className="daha-fazla__kaynak">{h.kaynak_adi}</span>
                  <span className="daha-fazla__baslik">{h.baslik}</span>
                  <span className="daha-fazla__saat">
                    {new Date(h.yayin_tarihi ?? h.eklenme_tarihi).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
