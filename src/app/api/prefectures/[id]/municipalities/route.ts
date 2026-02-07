import { NextResponse } from "next/server";
import { db } from "@/db";
import { municipalities } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prefectureId = parseInt(id, 10);

  if (isNaN(prefectureId)) {
    return NextResponse.json({ error: "Invalid prefecture ID" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(municipalities)
    .where(
      and(
        eq(municipalities.prefectureId, prefectureId),
        eq(municipalities.isActive, true)
      )
    )
    .orderBy(municipalities.name);

  return NextResponse.json(result);
}
