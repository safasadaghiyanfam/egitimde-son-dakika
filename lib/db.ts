/**
 * lib/db.ts
 * SQLite bağlantısı + tablo kurulumu (better-sqlite3)
 *
 * DB dosyası: proje kökündeki egitim.db
 * Next.js server component'lerinden import edilerek kullanılır.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// DB dosyasının yolu — proje kökü
const DB_DIR = path.join(process.cwd(), "db");
const DB_PATH = path.join(DB_DIR, "egitim.db");

// Klasör yoksa oluştur
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

/** Singleton bağlantı — her modül yüklemesinde tek bir instance */
let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);

  // WAL modu: eş zamanlı okuma/yazma performansı
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // Tablo oluştur (yoksa)
  _db.exec(`
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

  return _db;
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
