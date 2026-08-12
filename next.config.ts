import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 ve node-cron native modülleri için
  serverExternalPackages: ["better-sqlite3", "node-cron"],
  // instrumentation.ts Next.js 16'da varsayılan olarak aktif
};

export default nextConfig;
