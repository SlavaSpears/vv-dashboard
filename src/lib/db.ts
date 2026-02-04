import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const getClient = () => {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    // Only warn during build, don't crash. 
    // This allows the build to finish so the user can add the secret in Vercel.
    console.warn("⚠️ [DATABASE] DATABASE_URL is not defined. The site will error at runtime until this is added in Vercel Settings.");
  }
  
  return new PrismaClient({
    log: ["error"],
    // Provide a dummy URL for build stability if the real one is missing
    datasources: url ? undefined : {
      db: {
        url: "postgresql://postgres:postgres@localhost:5432/postgres" 
      }
    }
  });
};

export const prisma = globalForPrisma.prisma ?? getClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
