/**
 * lib/article-generator.ts
 * Haber başlığı ve içeriğine göre derinlemesine, habere özel, 4-6 paragraflı
 * detaylı haber gövdesi ve vurgu kutusu üreten editoryal içerik motoru.
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

  const bKucuk = baslik.toLowerCase();
  const oKucuk = ozet.toLowerCase();

  // Özet cümlelerini ayrıştır
  const ozetCumleleri = ozet
    .split(/(?<=[.!?])\s+/)
    .filter((c) => c.length > 10);

  // ── 1. GİRİŞ PARAGRAFLARI ──────────────────────────────────────────
  const girisParagraf1 = ozetCumleleri.length > 0
    ? `${ozetCumleleri.slice(0, 2).join(" ")} ${kaynak} haber akışından aktarılan bilgilere göre, alınan yeni kararlar ve yapılan resmi açıklamalar eğitim camiasında geniş yankı buldu.`
    : `Türkiye eğitim gündeminin öne çıkan konularından biri olan "${baslik}" başlığıyla ilgili resmi süreç ve uygulama detayları açıklandı. ${kaynak} tarafından geçilen habere göre, düzenleme doğrudan öğrenci, öğretmen ve eğitim kurumlarını ilgilendiriyor.`;

  const girisParagraf2 = `Açıklanan düzenlemenin detayları, ilgili bakanlık ve kurumsal mevzuatlar çerçevesinde şekillenirken; sürecin aksamadan yürütülmesi amacıyla gerekli altyapı ve bilgilendirme hazırlıklarının tamamlandığı bildirildi. Konuya ilişkin usul ve esasların tüm eğitim birimlerine iletildiği kaydedildi.`;

  // ── 2. KONUYA ÖZEL VURGU KUTUSU VE MADDELER ────────────────────────
  let vurguBasligi = "Öne Çıkan Gelişmeler";
  const maddeler: string[] = [];

  if (bKucuk.includes("yök") || bKucuk.includes("üniversite") || bKucuk.includes("fakülte") || oKucuk.includes("yükseköğretim")) {
    vurguBasligi = "Yükseköğretim Kararları ve Öne Çıkan Başlıklar";
    maddeler.push("Yükseköğretim Kurulu (YÖK) tarafından yayımlanan karar esasına göre akademik takvim çerçevesinde işlem yapılacak.");
    maddeler.push("Üniversitelerin ilgili fakülte ve enstitü kurulları, öğrenci kabul ve içerik şartlarını senato kararıyla duyuracak.");
    maddeler.push("Kontenjanlar, harç/katkı payı düzenlemeleri ve tanınırlık/denklik kriterlerinde açıklanan resmi esaslara uyulacak.");
    maddeler.push("Öğrenciler başvuru ve intibak durumlarını üniversitelerinin öğrenci işleri otomasyonu üzerinden takip edebilecek.");
  } else if (bKucuk.includes("meb") || bKucuk.includes("lgs") || bKucuk.includes("okul") || bKucuk.includes("öğretmen") || bKucuk.includes("maarif")) {
    vurguBasligi = "Milli Eğitim Bakanlığı Kararları ve Uygulama Esasları";
    maddeler.push("Milli Eğitim Bakanlığı (MEB) tarafından hazırlanan genelge uyarınca il/ilçe milli eğitim müdürlükleri yetkilendirildi.");
    maddeler.push("Öğrenci nakil, tercih ve sınav süreçleri e-Okul Veli Bilgilendirme Sistemi üzerinden kesintisiz yürütülecek.");
    maddeler.push("Okullarda uygulanacak müfredat ve ders içeriği düzenlemeleri öğretmenlere ve okul yönetimlerine tebliğ edildi.");
    maddeler.push("Veli ve öğrencilerin MEB resmi duyuruları dışında yapılan spekülatif bilgilere itibar etmemesi istendi.");
  } else if (bKucuk.includes("ösym") || bKucuk.includes("yks") || bKucuk.includes("kpss") || bKucuk.includes("sınav") || bKucuk.includes("ydts") || bKucuk.includes("yökdil")) {
    vurguBasligi = "Sınav Başvuru ve Değerlendirme Süreci Detayları";
    maddeler.push("Sınav takvimi, başvuru tarihleri ve kılavuz bilgileri ÖSYM / ilgili sınav merkezi tarafından güncellendi.");
    maddeler.push("Adaylar başvuru ve tercih işlemlerini T.C. kimlik numaraları ve şifreleriyle ÖSYM AİS portalı üzerinden gerçekleştirecek.");
    maddeler.push("Sınav giriş belgeleri ve salon atamaları sınav tarihinden en az bir hafta önce erişime açılacak.");
    maddeler.push("Değerlendirme sonuçları kılavuzda belirtilen puanlama kriterleri uyarınca ilan edilecek.");
  } else {
    vurguBasligi = "Resmi Açıklama ve Genel Şartlar";
    maddeler.push(`${kaynak} tarafından duyurulan gelişmelere göre uygulama takvimi resmi takvimle eş zamanlı başlatıldı.`);
    maddeler.push("İlgili kurumların yetkili kurulları tarafından onaylanan karar metni mevzuata uygun şekilde yürürlüğe girdi.");
    maddeler.push("Aday ve katılımcıların süreç boyunca duyurulan şartları ve süre sınırlarını dikkatle incelemeleri önem arz ediyor.");
    maddeler.push("Konuyla ilgili ek açıklamalar resmi portal üzerinden yapılmaya devam edecek.");
  }

  // ── 3. UYGULAMA VE SÜREÇ PARAGRAFLARI ─────────────────────────────
  const uygulamaBasligi = "Süreç, Takvim ve Başvuru Detayları";
  
  const uygulamaParagraf1 = `Düzenleme kapsamında izlenecek adımlar, ilgili kurum ve kuruluşların bilgi işlem sistemleri ile koordineli şekilde yürütülmektedir. Adayların ve ilgililerin mağduriyet yaşamamaları adına belirlenen başvuru ve müracaat tarihlerine titizlikle uymaları gerekmektedir. İşlemlerin büyük bir kısmı dijital e-Devlet ve resmi kurum portalları üzerinden şifreli erişimle yapılabilecektir.`;

  const uygulamaParagraf2 = `Bunun yanı sıra, kurumlar tarafından yayımlanan resmi kılavuz ve yönergelerde yer alan maddeler bağlayıcı nitelik taşımaktadır. Süreç içerisinde ortaya çıkabilecek istisnai durumlar veya ek kontenjan/hak tanımlamaları için kurum yetkililerinin yapacağı ek duyurular takip edilmelidir.`;

  // ── 4. SONUÇ VE TAVSİYELER ─────────────────────────────────────────
  const sonucParagraf = `Eğitimde Son Dakika olarak "${baslik}" konusundaki gelişmeleri, resmi kurum açıklamalarını ve takvim güncellemelerini anlık olarak aktarmayı sürdüreceğiz. Detaylı bilgi ve resmi bildirimler için ilgili bakanlık ve kurumların internet sayfalarını kontrol etmeniz tavsiye edilir.`;

  return [
    { tip: "paragraf", metin: girisParagraf1 },
    { tip: "paragraf", metin: girisParagraf2 },
    { tip: "vurgu_kutusu", metin: vurguBasligi, maddeler },
    { tip: "alt_baslik", metin: uygulamaBasligi },
    { tip: "paragraf", metin: uygulamaParagraf1 },
    { tip: "paragraf", metin: uygulamaParagraf2 },
    { tip: "alt_baslik", metin: "Değerlendirme ve Takip" },
    { tip: "paragraf", metin: sonucParagraf },
  ];
}
