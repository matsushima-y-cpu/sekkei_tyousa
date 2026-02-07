import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const items = await db
    .select()
    .from(projectItems)
    .where(eq(projectItems.projectId, id))
    .orderBy(projectItems.sortOrder);

  return NextResponse.json(items);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;

  // Support both single item and batch insert
  const itemsToInsert = Array.isArray(body) ? body : [body];

  const values = itemsToInsert.map((item: Record<string, unknown>, idx: number) => ({
    projectId: id,
    sourceItemId: item.sourceItemId ? Number(item.sourceItemId) : null,
    description: item.description as string,
    quantity: String(item.quantity || 1),
    unit: (item.unit as string) || "式",
    costPrice: Number(item.costPrice),
    sellingPrice: Number(item.sellingPrice),
    isSelected: item.isSelected !== false,
    sortOrder: Number(item.sortOrder || idx),
    notes: (item.notes as string) || null,
  }));

  const inserted = await db
    .insert(projectItems)
    .values(values)
    .returning();

  return NextResponse.json(inserted, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const itemId = body.itemId as string;

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  const [updated] = await db
    .update(projectItems)
    .set({
      description: body.description as string | undefined,
      quantity: body.quantity ? String(body.quantity) : undefined,
      costPrice: body.costPrice ? Number(body.costPrice) : undefined,
      sellingPrice: body.sellingPrice ? Number(body.sellingPrice) : undefined,
      isSelected: body.isSelected as boolean | undefined,
      sortOrder: body.sortOrder ? Number(body.sortOrder) : undefined,
      notes: body.notes as string | undefined,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(projectItems.id, itemId),
        eq(projectItems.projectId, id)
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
