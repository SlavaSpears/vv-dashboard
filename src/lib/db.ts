import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.warn("[PRISMA] DATABASE_URL not found. Using placeholder for build stability.");
  }

  // Prisma 7.3 removed 'url' from schema. Move connection logic to constructor.
  // We use 'as any' because the generated types incorrectly mark 'datasources' as 'never'
  // when the schema property is missing, but the runtime still honors this override.
  return new PrismaClient({
    datasources: {
      db: {
        url: url || "postgresql://unauthenticated@localhost:5432/placeholder",
      },
    },
    log: ["error"],
  } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
