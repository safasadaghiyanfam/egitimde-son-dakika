/**
 * lib/queries.ts
 * Tüm DB sorguları — async (@libsql/client)
 */

import { getDb, type Haber } from "./db";

/** Son N haberi çek (varsayılan 100) */
export async function sonHaberler(limit = 100): Promise<Haber[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM haberler
          ORDER BY COALESCE(yayin_tarihi, eklenme_tarihi) DESC
          LIMIT ?`,
    args: [limit],
  });
  return result.rows as unknown as Haber[];
}

/** Kategori bazlı çekme */
export async function kategoriHaberleri(
  kategori: string,
  limit = 20
): Promise<Haber[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM haberler
          WHERE kategori = ?
          ORDER BY COALESCE(yayin_tarihi, eklenme_tarihi) DESC
          LIMIT ?`,
    args: [kategori, limit],
  });
  return result.rows as unknown as Haber[];
}

/** Toplam haber sayısı */
export async function haberSayisi(): Promise<number> {
  const db = getDb();
  const result = await db.execute("SELECT COUNT(*) as n FROM haberler");
  return (result.rows[0] as unknown as { n: number }).n;
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

/**
 * Haberleri saat gruplarına ayır.
 */
export interface SaatGrubu {
  saat: string;
  haberler: Haber[];
}

export function saatGruplari(haberler: Haber[]): SaatGrubu[] {
  const grupMap = new Map<string, Haber[]>();

  for (const h of haberler) {
    const tarih = h.yayin_tarihi ?? h.eklenme_tarihi;
    const d = new Date(tarih);
    const saat = `${String(d.getHours()).padStart(2, "0")}:00`;

    if (!grupMap.has(saat)) grupMap.set(saat, []);
    grupMap.get(saat)!.push(h);
  }

  return Array.from(grupMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([saat, haberler]) => ({ saat, haberler }));
}
