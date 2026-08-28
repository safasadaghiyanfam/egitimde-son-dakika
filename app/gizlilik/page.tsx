import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Eğitimde Son Dakika gizlilik politikası — kişisel veri kullanımı hakkında bilgi.",
};

export default function GizlilikSayfasi() {
  return (
    <div className="wrap" style={{ maxWidth: "720px", padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "24px" }}>
        Gizlilik Politikası
      </h1>

      <p style={{ marginBottom: "16px", lineHeight: "1.7" }}>
        <strong>egitimdesondakika.com.tr</strong> olarak ziyaretçilerimizin gizliliğine saygı duyuyoruz.
        Bu sayfa, sitemizin veri kullanım politikasını açıklamaktadır.
      </p>

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: "24px 0 12px" }}>
        Toplanan Veriler
      </h2>
      <p style={{ marginBottom: "16px", lineHeight: "1.7" }}>
        Sitemiz, eğitim haberleri derleyen bir okuma platformudur. Kullanıcılardan herhangi bir
        kişisel bilgi (ad, e-posta, telefon vb.) toplamıyoruz. Sisteminizin standart sunucu
        erişim günlükleri (IP adresi, tarayıcı bilgisi, ziyaret saati) teknik amaçlarla
        geçici olarak tutulabilir.
      </p>

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: "24px 0 12px" }}>
        Çerezler (Cookies)
      </h2>
      <p style={{ marginBottom: "16px", lineHeight: "1.7" }}>
        Sitemiz şu an kişisel takip çerezi kullanmamaktadır. Analiz ya da reklam amaçlı
        üçüncü taraf çerezler bulunmamaktadır.
      </p>

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: "24px 0 12px" }}>
        İçerik Kaynakları
      </h2>
      <p style={{ marginBottom: "16px", lineHeight: "1.7" }}>
        Sitedeki haberler; Anadolu Ajansı (AA), İHA (İhlas Haber Ajansı), Son Dakika ve
        TRT Haber gibi kaynaklardan RSS beslemeleri aracılığıyla otomatik olarak derlenmektedir.
        İçeriklerin telif hakkı ilgili ajans ve kuruluşlara aittir. Sitemiz yalnızca başlık
        ve kısa özet yayımlamakta; içeriği kaynak göstererek aktarmaktadır.
      </p>

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: "24px 0 12px" }}>
        İletişim
      </h2>
      <p style={{ lineHeight: "1.7" }}>
        Gizlilik politikamıza ilişkin sorularınız için{" "}
        <a href="/iletisim" style={{ color: "var(--accent, #c00)" }}>İletişim</a>{" "}
        sayfamızı kullanabilirsiniz.
      </p>

      <p style={{ marginTop: "32px", fontSize: "13px", color: "#888" }}>
        Son güncelleme: Ağustos 2026
      </p>
    </div>
  );
}
