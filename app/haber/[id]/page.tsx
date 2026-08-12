import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { haberById, sonHaberler } from "../../../lib/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const haber = await haberById(Number(id));
  if (!haber) return { title: "Haber Bulunamadı" };
  return {
    title: haber.baslik,
    description: haber.ozet ?? undefined,
  };
}

export default async function HaberDetay({ params }: PageProps) {
  const { id } = await params;
  const haber = await haberById(Number(id));
  if (!haber) notFound();

  // İlgili haberler (aynı kategori)
  const tumHaberler = await sonHaberler(40);
  const ilgiliHaberler = tumHaberler
    .filter((h) => h.id !== haber.id && h.kategori === haber.kategori)
    .slice(0, 6);

  const tarih = new Date(haber.yayin_tarihi ?? haber.eklenme_tarihi).toLocaleString("tr-TR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const KATEGORİ_AD: Record<string, string> = {
    ilkokul: "İlk Okul", ortaokul: "Orta Okul", lise: "Lise",
    avrupa: "Avrupa Eğitim Gündemi", dunya: "Dünyadan Haberler", genel: "Gündem",
  };

  const kategoriAd = KATEGORİ_AD[haber.kategori] ?? haber.kategori;

  return (
    <div className="wrap haber-detay-wrap">

      {/* ─── 2 sütun: makale + kenar çubuğu ─── */}
      <div className="haber-detay-grid">

        {/* Makale */}
        <article className="haber-makale">

          {/* Breadcrumb */}
          <nav className="haber-breadcrumb">
            <a href="/">Ana Sayfa</a>
            <span>›</span>
            <a href={`/kategori/${haber.kategori}`}>{kategoriAd}</a>
          </nav>

          {/* Kaynak + tarih */}
          <div className="haber-meta">
            <span className="haber-meta__kaynak">{haber.kaynak_adi}</span>
            <span className="haber-meta__tarih">{tarih}</span>
          </div>

          {/* Başlık */}
          <h1 className="haber-baslik">{haber.baslik}</h1>

          {/* Ayırıcı çizgi */}
          <div className="haber-divider" />

          {/* Özet / Lead */}
          {haber.ozet && (
            <p className="haber-ozet">{haber.ozet}</p>
          )}

          {/* Haber Görseli */}
          {haber.resim_url && (
            <div className="haber-gorsel-wrap" style={{ margin: "24px 0" }}>
              <img
                src={haber.resim_url}
                alt={haber.baslik}
                style={{ width: "100%", height: "auto", display: "block", borderRadius: "4px" }}
              />
            </div>
          )}

          {/* Açıklama metni */}
          <p className="haber-devam-metin">
            Bu haberin tamamını orijinal kaynakta okumak için aşağıdaki butona tıklayın.
          </p>

          {/* Kaynağa git butonu */}
          <a
            href={haber.kaynak_url}
            target="_blank"
            rel="noopener noreferrer"
            className="haber-kaynak-btn"
          >
            Haberin tamamını {haber.kaynak_adi}&apos;nde oku →
          </a>

          {/* Küçük not */}
          <p className="haber-not">
            Bu haber <strong>{haber.kaynak_adi}</strong> tarafından yayımlanmıştır.
            Eğitimde Son Dakika, haberleri RSS beslemelerinden otomatik olarak derlemektedir.
          </p>

        </article>

        {/* Kenar çubuğu — İlgili haberler */}
        {ilgiliHaberler.length > 0 && (
          <aside className="haber-sidebar">
            <div className="haber-sidebar__title">{kategoriAd} Haberleri</div>
            {ilgiliHaberler.map((h) => (
              <div key={h.id} className="haber-sidebar__item">
                <span className="haber-sidebar__kaynak">{h.kaynak_adi}</span>
                <a href={`/haber/${h.id}`} className="haber-sidebar__link">
                  {h.baslik}
                </a>
              </div>
            ))}
          </aside>
        )}

      </div>
    </div>
  );
}
