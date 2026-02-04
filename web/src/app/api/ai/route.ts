import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { EventType, TaskStatus } from "@prisma/client";

// This route uses Prisma and must run on the Node.js runtime (not Edge).
export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const CommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("create_task"),
    title: z.string().min(1),
  }),
  z.object({
    type: z.literal("update_task_status"),
    id: z.string().min(1),
    status: z.nativeEnum(TaskStatus),
  }),
  z.object({
    type: z.literal("create_event"),
    eventType: z.nativeEnum(EventType).default(EventType.MEETING),
    title: z.string().min(1),
    person: z.string().optional().default(""),
    location: z.string().optional().default(""),
    startAtISO: z.string().min(1),
    endAtISO: z.string().optional(), // if missing -> +30m
    notes: z.string().optional().default(""),
  }),
  z.object({
    type: z.literal("reschedule_event"),
    person: z.string().min(1),
    fromISO: z.string().optional(), // optional for “move my call with X to …”
    toISO: z.string().min(1),
    durationMinutes: z.number().optional().default(30),
  }),
]);

function safeDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) throw new Error("Invalid date");
  return d;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { ok: false, error: "Missing text" },
        { status: 400 }
      );
    }

    const system = `
You are VV Control Room’s command parser.
Return ONLY JSON.

Commands:
1) create_task: { "type":"create_task", "title":"..." }

2) create_event: {
  "type":"create_event",
  "eventType":"MEETING"|"CALL",
  "title":"...",
  "person":"...",
  "location":"...",
  "startAtISO":"YYYY-MM-DDTHH:mm:ss.sssZ or local ISO",
  "endAtISO":"(optional)",
  "notes":"(optional)"
}

3) reschedule_event: {
  "type":"reschedule_event",
  "person":"Name",
  "fromISO":"(optional)",
  "toISO":"ISO",
  "durationMinutes":30
}

Rules:
- If user says “call”, use eventType="CALL".
- If endAtISO missing, default to +30 minutes.
- No markdown. No extra keys. JSON only.
`.trim();

    const resp = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      messages: [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
    });

    const raw = resp.choices[0]?.message?.content?.trim() ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { ok: false, error: "AI did not return JSON", raw },
        { status: 400 }
      );
    }

    const cmd = CommandSchema.safeParse(parsed);
    if (!cmd.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid command shape",
          issues: cmd.error.issues,
          raw,
        },
        { status: 400 }
      );
    }

    const c = cmd.data;

    if (c.type === "create_task") {
      const task = await prisma.task.create({ data: { title: c.title } });
      return NextResponse.json({ ok: true, executed: c, task });
    }

    if (c.type === "update_task_status") {
      const task = await prisma.task.update({
        where: { id: c.id },
        data: { status: c.status },
      });
      return NextResponse.json({ ok: true, executed: c, task });
    }

    if (c.type === "create_event") {
      const startAt = safeDate(c.startAtISO);
      const endAt = c.endAtISO
        ? safeDate(c.endAtISO)
        : new Date(startAt.getTime() + 30 * 60 * 1000);

      const event = await prisma.event.create({
        data: {
          type: c.eventType,
          title: c.title,
          person: c.person ?? "",
          location: c.location ?? "",
          startAt,
          endAt,
          notes: c.notes ?? "",
        },
      });

      return NextResponse.json({ ok: true, executed: c, event });
    }

    if (c.type === "reschedule_event") {
      // Pick the soonest upcoming event matching the person (good enough for v1)
      const next = await prisma.event.findFirst({
        where: { person: { contains: c.person, mode: "insensitive" } },
        orderBy: { startAt: "asc" },
      });

      if (!next) {
        return NextResponse.json(
          { ok: false, error: "No event found for person", executed: c },
          { status: 404 }
        );
      }

      const to = safeDate(c.toISO);
      const dur = c.durationMinutes ?? 30;

      const updated = await prisma.event.update({
        where: { id: next.id },
        data: {
          startAt: to,
          endAt: new Date(to.getTime() + dur * 60 * 1000),
        },
      });

      return NextResponse.json({ ok: true, executed: c, event: updated });
    }

    return NextResponse.json(
      { ok: false, error: "Unhandled command" },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
