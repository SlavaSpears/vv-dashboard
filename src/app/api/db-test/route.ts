import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("[DB-TEST] Attempting count query...");
    const count = await prisma.task.count();
    return NextResponse.json({ ok: true, count, message: "Database connection successful." });
  } catch (err: any) {
    console.error("[DB-TEST] Query failed:", err);
    return NextResponse.json({ 
      ok: false, 
      error: err.message, 
      stack: err.stack,
      env_db_present: !!process.env.DATABASE_URL
    }, { status: 500 });
  }
}
