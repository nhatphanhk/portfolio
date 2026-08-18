import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL: dùng cho migrations (tránh lỗi advisory lock với pooled connection)
    // DATABASE_URL: dùng cho runtime queries (pooled, hiệu năng cao)
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
