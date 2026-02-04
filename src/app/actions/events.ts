"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EventType } from "@prisma/client";

export async function createEvent(input: {
  type?: EventType;
  title: string;
  person?: string;
  location?: string;
  startAt: Date;
  endAt: Date;
  notes?: string;
}) {
  await prisma.event.create({
    data: {
      type: input.type ?? EventType.MEETING,
      title: input.title.trim(),
      person: input.person ?? "",
      location: input.location ?? "",
      startAt: input.startAt,
      endAt: input.endAt,
      notes: input.notes ?? "",
    },
  });

  revalidatePath("/events");
  revalidatePath("/");
}

export async function updateEvent(
  id: string,
  data: Partial<{
    type: EventType;
    title: string;
    person: string;
    location: string;
    startAt: Date;
    endAt: Date;
    notes: string;
  }>
) {
  await prisma.event.update({ where: { id }, data });
  revalidatePath("/events");
  revalidatePath("/");
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  revalidatePath("/events");
  revalidatePath("/");
}
