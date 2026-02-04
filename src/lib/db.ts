import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrisma() {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  
  if (!url) {
    console.warn("[PRISMA] DATABASE_URL is missing during initialization. Using placeholder for build stability.");
  }

  // Use the correct Prisma 7.x override pattern
  return new PrismaClient({
    datasources: {
      db: {
        url: url || "postgresql://postgres:postgres@localhost:5432/postgres",
      },
    },
    log: ["error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
