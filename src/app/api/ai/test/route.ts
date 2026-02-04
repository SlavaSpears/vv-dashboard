export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { mode, apiKey } = await req.json();

    if (mode === "OFF") {
      return NextResponse.json({ ok: false, message: "AI Mode is Off." });
    }

    if (mode === "DEMO") {
      // Simulate connection
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ ok: true, message: "Connection successful (Demo Mode)." });
    }

    if (mode === "BYOK") {
      if (!apiKey) {
        return NextResponse.json({ ok: false, message: "API Key required." });
      }

      // Minimal health check for Gemini
      // Note: In a real app, this would use the Google Generative AI SDK
      // For this task, we'll simulate the ping logic.
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key=${apiKey}`,
          { method: "GET" }
        );
        
        if (response.ok) {
           return NextResponse.json({ ok: true, message: "Connection successful." });
        } else {
           const err = await response.json();
           return NextResponse.json({ ok: false, message: `Failed: ${err.error?.message || response.statusText}` });
        }
      } catch (err) {
        return NextResponse.json({ ok: false, message: "Connection failed. Please check your network and API key." });
      }
    }

    return NextResponse.json({ ok: false, message: "Invalid mode." });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}
