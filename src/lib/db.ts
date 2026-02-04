import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const getClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not defined in environment variables. Please ensure it is set in your Vercel Dashboard Settings."
    );
  }
  return new PrismaClient({
    log: ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? getClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
