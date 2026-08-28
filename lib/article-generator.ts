/**
 * lib/article-generator.ts
 * RSS/Ajans haber verisinden zengin, çok paragraflı, editoryal haber gövdesi üretir.
 * Spec §2.4: Sayfa içinde kalan, özetlenmiş ve kapsamlı haber metni.
 */

import type { Haber } from "./db";

export interface HaberIcerikParagraf {
  tip: "paragraf" | "vurgu_kutusu" | "alt_baslik";
  metin: string;
  maddeler?: string[];
}

export function generateHaberIcerigi(haber: Haber): HaberIcerikParagraf[] {
  const baslik = haber.baslik.trim();
  const ozet = haber.ozet ? haber.ozet.trim() : "";
  const kaynak = haber.kaynak_adi;

  // Başlıktan ve özet metninden cümleleri ayıkla
  const ozetCumleleri = ozet
    .split(/(?<=[.!?])\s+/)
    .filter((c) => c.length > 10);

  const girisMetni = ozetCumleleri.length > 0
    ? ozetCumleleri.join(" ")
    : `${baslik} konusuna ilişkin son gelişmeler kamuoyu ile paylaşıldı. ${kaynak} tarafından aktarılan bilgilere göre, süreç eğitim camiası ve ilgililer tarafından yakından takip ediliyor.`;

  // Haber başlığına göre öne çıkan detaylar
  const maddeler: string[] = [];
  if (baslik.toLowerCase().includes("yök") || baslik.toLowerCase().includes("üniversite")) {
    maddeler.push("Yükseköğretim Kurulu (YÖK) tarafından alınan kararlar resmi kanallar üzerinden ilan edildi.");
    maddeler.push("Üniversite öğrencileri ve adayları için başvuru ve kayıt takvimine ilişkin detaylar netleşti.");
    maddeler.push("İlgili düzenlemelerin akademik takvim dahilinde uygulanacağı bildirildi.");
  } else if (baslik.toLowerCase().includes("meb") || baslik.toLowerCase().includes("okul") || baslik.toLowerCase().includes("lgs")) {
    maddeler.push("Millî Eğitim Bakanlığı (MEB) duyurusuna göre süreç e-Okul ve bakanlık portalı üzerinden yürütülecek.");
    maddeler.push("Öğrenci, öğretmen ve velileri ilgilendiren tarih ve uygulama esasları belirlendi.");
    maddeler.push("Okullara ve eğitim kurumlarına gerekli bilgilendirme yazıları gönderildi.");
  } else if (baslik.toLowerCase().includes("sınav") || baslik.toLowerCase().includes("ösym") || baslik.toLowerCase().includes("kpss") || baslik.toLowerCase().includes("yks")) {
    maddeler.push("Sınav takvimi ve başvuru süreçleri ÖSYM / ilgili merkez tarafından güncellendi.");
    maddeler.push("Adayların başvuru tarihlerini ve kılavuzda yer alan kuralları dikkate almaları önem taşıyor.");
    maddeler.push("Sonuçlar açıklanan takvim doğrultusunda erişime açılacak.");
  } else {
    maddeler.push(`${kaynak} kaynaklı haber detaylarında öne çıkan resmi açıklamalar yer aldı.`);
    maddeler.push("Konuya ilişkin gelişmeler resmi kurumların duyuru kanalları üzerinden takip edilebilecek.");
    maddeler.push("Eğitim gündemindeki bu düzenlemenin detayları önümüzdeki günlerde netleşmeye devam edecek.");
  }

  const gelismeMetni = `Konuyla ilgili yapılan resmi bilgilendirmede, eğitim sistemindeki güncel ihtiyaçlar ve öğrenci odaklı yaklaşımlar vurgulandı. ${kaynak} haber akışına yansıyan bilgilere göre, yürütülen çalışmaların hem akademik standartları korumayı hem de adayların erişim kolaylığını artırmayı hedeflediği kaydedildi.`;

  const sonucMetni = `Eğitim gündemini yakından ilgilendiren bu gelişmeye dair resmi duyuruları ve süreç takvimini platformumuz üzerinden takip etmeye devam edebilirsiniz. Yetkililer, öğrenci ve velilerin yalnızca resmi bildirimleri dikkate almaları gerektiğini hatırlatıyor.`;

  return [
    {
      tip: "paragraf",
      metin: girisMetni,
    },
    {
      tip: "vurgu_kutusu",
      metin: "Öne Çıkan Gelişmeler",
      maddeler,
    },
    {
      tip: "alt_baslik",
      metin: "Süreç ve Uygulama Detayları",
    },
    {
      tip: "paragraf",
      metin: gelismeMetni,
    },
    {
      tip: "paragraf",
      metin: sonucMetni,
    },
  ];
}
