import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // If DIRECT_URL is configured for local localhost but local DB isn't used, prefer DATABASE_URL
    url:
      process.env.DIRECT_URL && !process.env.DIRECT_URL.includes("localhost")
        ? process.env.DIRECT_URL
        : (process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? ""),
  },
});
