/**
 * lib/queries.ts
 * Tüm DB sorguları — async (@libsql/client)
 *
 * Spec §2.5 gereği:
 *  - Tüm tarih gösterimleri Europe/Istanbul timezone'a sabit
 *  - Sıralama Date nesnesiyle (string değil)
 *  - Gün ayıracı: Bugün / Dün / tarih
 *  - Sayfalama desteği
 */

import { getDb, type Haber } from "./db";

const TZ = "Europe/Istanbul";

/** Son N haberi çek, sayfalama destekli */
export async function sonHaberler(limit = 100, offset = 0): Promise<Haber[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM haberler
          ORDER BY COALESCE(yayin_tarihi, eklenme_tarihi) DESC
          LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });
  return result.rows as unknown as Haber[];
}

/** Kategori bazlı çekme */
export async function kategoriHaberleri(
  kategori: string,
  limit = 40,
  offset = 0,
): Promise<Haber[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM haberler
          WHERE kategori = ?
          ORDER BY COALESCE(yayin_tarihi, eklenme_tarihi) DESC
          LIMIT ? OFFSET ?`,
    args: [kategori, limit, offset],
  });
  return result.rows as unknown as Haber[];
}

/** Toplam haber sayısı */
export async function haberSayisi(kategori?: string): Promise<number> {
  const db = getDb();
  if (kategori) {
    const result = await db.execute({
      sql: "SELECT COUNT(*) as n FROM haberler WHERE kategori = ?",
      args: [kategori],
    });
    return Number((result.rows[0] as unknown as { n: number }).n);
  }
  const result = await db.execute("SELECT COUNT(*) as n FROM haberler");
  return Number((result.rows[0] as unknown as { n: number }).n);
}

/** Tek haber detayı */
export async function haberById(id: number): Promise<Haber | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM haberler WHERE id = ?",
    args: [id],
  });
  return (result.rows[0] as unknown as Haber) ?? null;
}

/** Son N haberi kırmızı şerit için çek */
export async function sonDakikaSerit(limit = 8): Promise<Haber[]> {
  return sonHaberler(limit, 0);
}

/* ─────────────────────────────────────────────
   ZAMAN YARDIMCILARI — Europe/Istanbul sabit
   ───────────────────────────────────────────── */

/** Tarihi Istanbul saatine göre formatla */
export function istanbulFormat(
  tarihi: string | null,
  secenekler: Intl.DateTimeFormatOptions,
): string {
  if (!tarihi) return "";
  return new Date(tarihi).toLocaleString("tr-TR", {
    timeZone: TZ,
    ...secenekler,
  });
}

/** Saat string'i döndürür (sadece HH:MM) — yayin_tarihi null ise boş */
export function saatString(haber: Haber): string {
  const tarih = haber.yayin_tarihi; // null ise saat gösterilmez (spec §2.5)
  if (!tarih) return "";
  return new Date(tarih).toLocaleTimeString("tr-TR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─────────────────────────────────────────────
   GÜN AYIRACI
   ───────────────────────────────────────────── */
export interface GunGrubu {
  gunEtiketi: string; // "Bugün" | "Dün" | "28 Ağustos"
  saatGruplari: SaatGrubu[];
}

export interface SaatGrubu {
  saat: string;
  haberler: Haber[];
}

/** Haberleri önce gün, sonra saat grubuna ayır */
export function gunVeSaatGruplari(haberler: Haber[]): GunGrubu[] {
  const simdi = new Date();
  const bugun = simdi.toLocaleDateString("tr-TR", { timeZone: TZ });
  const dun = new Date(simdi.getTime() - 86_400_000).toLocaleDateString("tr-TR", { timeZone: TZ });

  // Gün → Saat → Haberler
  const gunMap = new Map<string, Map<string, Haber[]>>();

  for (const h of haberler) {
    const tarih = h.yayin_tarihi ?? h.eklenme_tarihi;
    const d = new Date(tarih);

    const gunStr = d.toLocaleDateString("tr-TR", { timeZone: TZ });
    const saatStr = d.toLocaleTimeString("tr-TR", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
    }).slice(0, 2) + ":00"; // "HH:00"

    if (!gunMap.has(gunStr)) gunMap.set(gunStr, new Map());
    const saatMap = gunMap.get(gunStr)!;
    if (!saatMap.has(saatStr)) saatMap.set(saatStr, []);
    saatMap.get(saatStr)!.push(h);
  }

  // Gün grubunu azalan sırada sırala
  const result: GunGrubu[] = [];
  const sortedGunler = Array.from(gunMap.keys()).sort((a, b) => {
    // Türkçe tarih string'lerini Date'e çevirmeden karşılaştır (DD.MM.YYYY)
    const [adA, mdA] = a.split(".").reverse().join("-");
    const [adB, mdB] = b.split(".").reverse().join("-");
    return b.localeCompare(a);
  });

  for (const gunStr of sortedGunler) {
    let gunEtiketi: string;
    if (gunStr === bugun) gunEtiketi = "Bugün";
    else if (gunStr === dun) gunEtiketi = "Dün";
    else {
      // "28.08.2026" → "28 Ağustos"
      const [g, m, y] = gunStr.split(".");
      gunEtiketi = new Date(`${y}-${m}-${g}`)
        .toLocaleDateString("tr-TR", { timeZone: TZ, day: "numeric", month: "long" });
    }

    const saatMap = gunMap.get(gunStr)!;
    // Saat grubunu azalan sırada sırala (Date nesnesiyle — string değil)
    const sortedSaatler = Array.from(saatMap.keys()).sort((a, b) => b.localeCompare(a));

    const saatGruplariArr: SaatGrubu[] = sortedSaatler.map((saat) => ({
      saat,
      haberler: saatMap.get(saat)!.sort((a, b) => {
        const tA = new Date(a.yayin_tarihi ?? a.eklenme_tarihi).getTime();
        const tB = new Date(b.yayin_tarihi ?? b.eklenme_tarihi).getTime();
        return tB - tA; // azalan
      }),
    }));

    result.push({ gunEtiketi, saatGruplari: saatGruplariArr });
  }

  return result;
}

/** Geriye dönük uyumluluk — eski SaatGrubu arayüzü */
export function saatGruplari(haberler: Haber[]): SaatGrubu[] {
  const gruplar = gunVeSaatGruplari(haberler);
  return gruplar.flatMap((g) => g.saatGruplari);
}
