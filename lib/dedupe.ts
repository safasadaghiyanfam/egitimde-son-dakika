/**
 * lib/dedupe.ts
 * Haber tekrarını engellemek için SHA-256 hash üretimi.
 * Hash = başlığın normalize edilmiş SHA-256'sı.
 */

import crypto from "crypto";

/**
 * Başlığı normalize et ve SHA-256 hash üret.
 * Aynı haber farklı kaynaklarda küçük farklılıklarla gelebilir,
 * bu yüzden Türkçe karakterleri de düzeltiyor ve boşlukları temizliyoruz.
 */
export function haberHash(baslik: string): string {
  const normalized = baslik
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}
