import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { investigationItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const prefectureId = searchParams.get("prefecture_id");
  const municipality = searchParams.get("municipality");

  if (!prefectureId) {
    return NextResponse.json(
      { error: "prefecture_id is required" },
      { status: 400 }
    );
  }

  const conditions = [
    eq(investigationItems.prefectureId, parseInt(prefectureId, 10)),
    eq(investigationItems.isActive, true),
  ];

  if (municipality) {
    conditions.push(eq(investigationItems.municipalityName, municipality));
  }

  const result = await db
    .select()
    .from(investigationItems)
    .where(and(...conditions))
    .orderBy(investigationItems.sortOrder);

  return NextResponse.json(result);
}
