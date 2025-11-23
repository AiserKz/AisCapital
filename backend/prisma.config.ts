import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: "postgresql://aiser:QK38fONvbotz74gyBi1ahOSDdV3dcU7S@localhost:5432/monopoly_db?schema=public",
  },
});
