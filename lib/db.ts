/**
 * lib/db.ts
 * Veritabanı bağlantısı — geliştirmede yerel SQLite, üretimde Turso (libSQL)
 *
 * Ortam değişkenleri:
 *   TURSO_DATABASE_URL  — libsql://your-db.turso.io  (Vercel'de zorunlu)
 *   TURSO_AUTH_TOKEN    — eyJ...                      (Vercel'de zorunlu)
 *
 * Yerel geliştirmede bu ikisi yoksa file:./db/egitim.db kullanılır.
 */

import { createClient, type Client } from "@libsql/client";

/* ── Bağlantı ── */
let _client: Client | null = null;

export function getDb(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL ?? "file:./db/egitim.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  _client = createClient({ url, authToken });
  return _client;
}

/* ── Tablo kurulumu (uygulama açılışında çağrılır) ── */
export async function setupDb(): Promise<void> {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS haberler (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      baslik        TEXT    NOT NULL,
      ozet          TEXT,
      kaynak_url    TEXT    NOT NULL,
      kaynak_adi    TEXT    NOT NULL,
      kategori      TEXT    NOT NULL DEFAULT 'genel',
      yayin_tarihi  DATETIME,
      eklenme_tarihi DATETIME NOT NULL DEFAULT (datetime('now')),
      hash          TEXT    NOT NULL UNIQUE
    );

    CREATE INDEX IF NOT EXISTS idx_yayin_tarihi
      ON haberler (yayin_tarihi DESC);

    CREATE INDEX IF NOT EXISTS idx_kategori
      ON haberler (kategori);
  `);
}

/* ── Yardımcı tip ── */
export interface Haber {
  id: number;
  baslik: string;
  ozet: string | null;
  kaynak_url: string;
  kaynak_adi: string;
  kategori: string;
  yayin_tarihi: string | null;
  eklenme_tarihi: string;
  hash: string;
}
