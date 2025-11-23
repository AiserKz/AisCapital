import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  host: "localhost",
  port: 5432,
  user: "aiser",
  password: "QK38fONvbotz74gyBi1ahOSDdV3dcU7S",
  database: "monopoly_db",
  schema: "public",
});
export const prisma = new PrismaClient({ adapter });
