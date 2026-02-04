import "server-only";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  
  // Log presence but NOT the full secret
  if (!connectionString) {
    console.error("[DB] DATABASE_URL is EMPTY or UNDEFINED");
  } else {
    console.log("[DB] DATABASE_URL detected (starts with: " + connectionString.substring(0, 10) + "...)");
  }

  try {
    const pool = new Pool({ 
      connectionString,
      max: 10,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000, // 10s wait for connection
    });

    pool.on('error', (err) => {
      console.error('[DB] POOL ERROR:', err);
    });

    const adapter = new PrismaPg(pool);
    
    // @ts-ignore - Prisma 7.3 types might be strict
    const client = new PrismaClient({
      adapter,
      log: ["error", "info", "warn"],
    });

    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return client;
  } catch (err) {
    console.error("[DB] CRITICAL INITIALIZATION ERROR:", err);
    throw err;
  }
}

export const prisma = getPrisma();
