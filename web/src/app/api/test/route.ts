import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasDb: Boolean(process.env.DATABASE_URL),
    hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
  });
}
