import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectSurvey } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const survey = await db.query.projectSurvey.findFirst({
    where: eq(projectSurvey.projectId, id),
  });

  return NextResponse.json(survey || null);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;

  // Check if survey exists
  const existing = await db.query.projectSurvey.findFirst({
    where: eq(projectSurvey.projectId, id),
  });

  if (existing) {
    // Update
    const [updated] = await db
      .update(projectSurvey)
      .set({
        ...body,
        updatedAt: new Date(),
      } as typeof projectSurvey.$inferInsert)
      .where(eq(projectSurvey.projectId, id))
      .returning();

    return NextResponse.json(updated);
  } else {
    // Insert
    const [created] = await db
      .insert(projectSurvey)
      .values({
        projectId: id,
        ...body,
      } as typeof projectSurvey.$inferInsert)
      .returning();

    return NextResponse.json(created, { status: 201 });
  }
}
