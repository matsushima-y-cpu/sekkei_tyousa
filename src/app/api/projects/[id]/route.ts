import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      prefecture: true,
      items: {
        orderBy: (items, { asc }) => [asc(items.sortOrder)],
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;

  const [updated] = await db
    .update(projects)
    .set({
      propertyName: body.propertyName as string | undefined,
      prefectureId: body.prefectureId ? Number(body.prefectureId) : undefined,
      municipality: body.municipality as string | undefined,
      lotNumber: body.lotNumber as string | undefined,
      addressDisplay: body.addressDisplay as string | undefined,
      siteArea: body.siteArea ? String(body.siteArea) : undefined,
      buildingScale: body.buildingScale as string | undefined,
      cityPlanningZone: body.cityPlanningZone as string | undefined,
      firePrevention: body.firePrevention as string | undefined,
      zoning: body.zoning as string | undefined,
      heightDistrict: body.heightDistrict as string | undefined,
      buildingCoverage: body.buildingCoverage ? String(body.buildingCoverage) : undefined,
      floorAreaRatio: body.floorAreaRatio ? String(body.floorAreaRatio) : undefined,
      customerName: body.customerName as string | undefined,
      status: body.status as "draft" | "investigating" | "estimated" | "completed" | undefined,
      notes: body.notes as string | undefined,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.delete(projects).where(eq(projects.id, id));

  return NextResponse.json({ success: true });
}
