import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, apiKey, mode } = await req.json();

    if (mode === "OFF") {
      return NextResponse.json({ ok: false, message: "AI disabled in Settings." });
    }

    if (mode === "DEMO") {
      // Return VV-tone canned responses
      const responses = [
        "Intelligence received. I've noted the signal.",
        "Understood. Briefing updated with your latest input.",
        "Analyzing. The VV dashboard is optimal for these parameters.",
        "Acknowledge. Proceeding with standard operator protocols.",
      ];
      const random = responses[Math.floor(Math.random() * responses.length)];
      return NextResponse.json({ ok: true, message: random });
    }

    if (mode === "BYOK") {
      if (!apiKey) {
        return NextResponse.json({ ok: false, message: "BYO Key mode active: API Key is missing in Settings." });
      }

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: message }] }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        const data = await response.json();
        
        if (response.ok) {
           const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
           return NextResponse.json({ ok: true, message: text });
        } else {
           return NextResponse.json({ ok: false, message: `Gemini Error: ${data.error?.message || response.statusText}` });
        }
      } catch (err) {
        return NextResponse.json({ ok: false, message: "Failed to reach AI provider. Verify your key and network." });
      }
    }

    return NextResponse.json({ ok: false, message: "Unsupported AI mode." });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "System failure. Please check logs." }, { status: 500 });
  }
}
