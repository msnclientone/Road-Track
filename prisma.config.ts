import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://road_track:road_track@localhost:5432/road_track",
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
