// src/lib/db.ts
import "server-only";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL is missing in production environment");
}

const pool = new Pool({ 
  connectionString,
  max: 20,
  idleTimeoutMillis: 60000, // Increase idle timeout
  connectionTimeoutMillis: 5000, // Increase connection timeout to 5s
  ssl: connectionString?.includes("sslmode=disable") 
    ? false 
    : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"], // Reduced logging for production
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
