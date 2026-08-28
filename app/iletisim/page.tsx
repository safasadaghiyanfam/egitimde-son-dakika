import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Eğitimde Son Dakika iletişim sayfası.",
};

export default function IletisimSayfasi() {
  return (
    <div className="wrap" style={{ maxWidth: "720px", padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "24px" }}>
        İletişim
      </h1>

      <p style={{ marginBottom: "24px", lineHeight: "1.7" }}>
        <strong>Eğitimde Son Dakika</strong>, Türkiye eğitim gündemini ajans beslemelerinden
        otomatik olarak derleyen bir haber platformudur.
      </p>

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: "0 0 12px" }}>
        Haber Düzeltme Talebi
      </h2>
      <p style={{ marginBottom: "24px", lineHeight: "1.7" }}>
        Sitede yer alan bir haberde hata veya yanlışlık tespit ettiyseniz lütfen aşağıdaki
        bilgileri içeren bir mesaj gönderin: haber başlığı, hata açıklaması ve doğru bilginin
        kaynağı. Talebinizi en kısa sürede değerlendireceğiz.
      </p>

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: "0 0 12px" }}>
        İçerik Kaldırma Talebi
      </h2>
      <p style={{ marginBottom: "24px", lineHeight: "1.7" }}>
        Telif hakkı veya kişilik hakkı ihlali gerekçesiyle içerik kaldırma talebinde
        bulunmak için ilgili haberin URL'si ve talebinizin yasal dayanağını belirterek
        iletişime geçebilirsiniz.
      </p>

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: "0 0 12px" }}>
        Genel İletişim
      </h2>
      <p style={{ lineHeight: "1.7" }}>
        Diğer konular için{" "}
        <strong>iletisim [at] egitimdesondakika.com.tr</strong>{" "}
        adresine e-posta gönderebilirsiniz.
      </p>

      <p style={{ marginTop: "32px", fontSize: "13px", color: "#888" }}>
        Yanıt süresi iş günlerinde 2–5 gündür.
      </p>
    </div>
  );
}
