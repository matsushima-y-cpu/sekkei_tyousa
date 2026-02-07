import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = (page - 1) * limit;

  const conditions = [];

  if (status) {
    conditions.push(eq(projects.status, status as "draft" | "investigating" | "estimated" | "completed"));
  }

  if (search) {
    conditions.push(
      or(
        ilike(projects.propertyName, `%${search}%`),
        ilike(projects.customerName, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0
    ? conditions.length === 1
      ? conditions[0]
      : sql`${conditions[0]} AND ${conditions[1]}`
    : undefined;

  const [result, countResult] = await Promise.all([
    db
      .select()
      .from(projects)
      .where(whereClause)
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(whereClause),
  ]);

  return NextResponse.json({
    data: result,
    total: Number(countResult[0].count),
    page,
    limit,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as Record<string, unknown>;

  const [project] = await db
    .insert(projects)
    .values({
      propertyName: body.propertyName as string,
      prefectureId: body.prefectureId ? Number(body.prefectureId) : null,
      municipality: (body.municipality as string) || null,
      lotNumber: (body.lotNumber as string) || null,
      addressDisplay: (body.addressDisplay as string) || null,
      siteArea: body.siteArea ? String(body.siteArea) : null,
      buildingScale: (body.buildingScale as string) || null,
      cityPlanningZone: (body.cityPlanningZone as string) || null,
      firePrevention: (body.firePrevention as string) || null,
      zoning: (body.zoning as string) || null,
      heightDistrict: (body.heightDistrict as string) || null,
      buildingCoverage: body.buildingCoverage ? String(body.buildingCoverage) : null,
      floorAreaRatio: body.floorAreaRatio ? String(body.floorAreaRatio) : null,
      customerName: (body.customerName as string) || null,
      status: "draft",
      notes: (body.notes as string) || null,
    })
    .returning();

  return NextResponse.json(project, { status: 201 });
}
