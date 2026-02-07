import { NextResponse } from "next/server";
import { db } from "@/db";
import { prefectures, municipalities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const result = await db
    .select()
    .from(prefectures)
    .where(eq(prefectures.isActive, true))
    .orderBy(prefectures.code);

  return NextResponse.json(result);
}
