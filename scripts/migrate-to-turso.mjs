/**
 * scripts/migrate-to-turso.mjs
 * Yerel SQLite'daki haberleri Turso bulut veritabanına aktarır.
 * Çalıştırma: node scripts/migrate-to-turso.mjs
 */

import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

// Ortam değişkenlerini .env.local'dan oku
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const [key, ...val] = line.split("=");
  if (key && val.length) process.env[key.trim()] = val.join("=").trim();
}

const TURSO_URL   = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("TURSO_DATABASE_URL ve TURSO_AUTH_TOKEN gerekli!");
  process.exit(1);
}

// Yerel SQLite
const localDb = new Database(join(__dirname, "../db/egitim.db"));

// Turso client
const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

// Tüm haberleri çek
const haberler = localDb.prepare("SELECT * FROM haberler ORDER BY id").all();
console.log(`Yerel DB: ${haberler.length} haber bulundu`);

// Turso'ya toplu aktar
let eklenen = 0;
let atlanan = 0;

for (const h of haberler) {
  try {
    const result = await turso.execute({
      sql: `INSERT OR IGNORE INTO haberler
              (id, baslik, ozet, kaynak_url, kaynak_adi, kategori, yayin_tarihi, eklenme_tarihi, hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        h.id, h.baslik, h.ozet, h.kaynak_url, h.kaynak_adi,
        h.kategori, h.yayin_tarihi, h.eklenme_tarihi, h.hash
      ],
    });
    if (result.rowsAffected > 0) eklenen++;
    else atlanan++;
  } catch (e) {
    console.error(`Hata (id=${h.id}):`, e.message);
    atlanan++;
  }
}

// Sonuç kontrol
const { rows } = await turso.execute("SELECT COUNT(*) as n FROM haberler");
console.log(`\n✅ Tamamlandı!`);
console.log(`   Eklenen  : ${eklenen}`);
console.log(`   Atlanan  : ${atlanan}`);
console.log(`   Turso'da : ${rows[0].n} haber`);

localDb.close();
