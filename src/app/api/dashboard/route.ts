import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  const [stats, recentProjects] = await Promise.all([
    db
      .select({
        status: projects.status,
        count: sql<number>`count(*)`,
      })
      .from(projects)
      .groupBy(projects.status),
    db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(5),
  ]);

  const statusCounts: Record<string, number> = {
    draft: 0,
    investigating: 0,
    estimated: 0,
    completed: 0,
  };

  for (const row of stats) {
    statusCounts[row.status] = Number(row.count);
  }

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return NextResponse.json({
    total,
    statusCounts,
    recentProjects,
  });
}
