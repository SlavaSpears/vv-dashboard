import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrisma() {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  
  if (!url) {
    console.warn("[PRISMA] CRITICAL: DATABASE_URL is missing.");
  } else {
    console.log("[PRISMA] Initialization starting with URL: " + url.substring(0, 15) + "...");
  }

  // Force the datasource URL even if the schema/types say it's not possible (Prisma 7 bypass)
  const client = new PrismaClient({
    datasourceUrl: url,
    log: ["error", "warn"],
  } as any);

  return client;
}

export const prisma = globalForPrisma.prisma ?? getPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
