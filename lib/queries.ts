/**
 * lib/queries.ts
 * Tüm DB sorguları tek dosyada — page.tsx'ten import edilir.
 */

import { getDb, Haber } from "./db";

/** Son N haberi çek (varsayılan 100) */
export function sonHaberler(limit = 100): Haber[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM haberler
       ORDER BY
         COALESCE(yayin_tarihi, eklenme_tarihi) DESC
       LIMIT ?`
    )
    .all(limit) as Haber[];
}

/** Kategori bazlı çekme */
export function kategoriHaberleri(kategori: string, limit = 20): Haber[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM haberler
       WHERE kategori = ?
       ORDER BY COALESCE(yayin_tarihi, eklenme_tarihi) DESC
       LIMIT ?`
    )
    .all(kategori, limit) as Haber[];
}

/** Toplam haber sayısı */
export function haberSayisi(): number {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as n FROM haberler").get() as { n: number };
  return row.n;
}

/** Tek haber detayı */
export function haberById(id: number): Haber | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM haberler WHERE id = ?").get(id) as Haber) ?? null;
}

/**
 * Haberleri saat gruplarına ayır.
 * Aynı saatin başlıklarını tek grup olarak döndürür.
 */
export interface SaatGrubu {
  saat: string;   // "22:00", "21:00" vb.
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
