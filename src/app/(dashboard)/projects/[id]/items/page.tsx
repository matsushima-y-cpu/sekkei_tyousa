export const dynamic = "force-dynamic";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ItemSelector } from "@/components/item-selector";

export default async function ProjectItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    notFound();
  }

  return (
    <ItemSelector
      projectId={id}
      prefectureId={project.prefectureId}
      municipality={project.municipality}
    />
  );
}
