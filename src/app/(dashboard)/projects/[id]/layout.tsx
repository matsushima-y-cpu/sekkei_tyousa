export const dynamic = "force-dynamic";

import { db } from "@/db";
import { projects, prefectures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import { ProjectTabs } from "@/components/project-tabs";

const STATUS_LABELS: Record<string, string> = {
  draft: "下書き",
  investigating: "調査中",
  estimated: "見積済",
  completed: "完了",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  investigating: "default",
  estimated: "secondary",
  completed: "default",
};

export default async function ProjectDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: { prefecture: true },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{project.propertyName}</h2>
              <Badge variant={STATUS_VARIANTS[project.status] || "outline"}>
                {STATUS_LABELS[project.status] || project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {project.prefecture?.name}
              {project.municipality ? ` ${project.municipality}` : ""}
              {project.customerName ? ` / ${project.customerName}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/api/projects/${id}/export?type=survey`}>
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              調査書Excel
            </Button>
          </a>
          <a href={`/api/projects/${id}/export?type=estimate`}>
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              見積書Excel
            </Button>
          </a>
          <Link href={`/projects/${id}/edit`}>
            <Button size="sm">編集</Button>
          </Link>
        </div>
      </div>

      <ProjectTabs projectId={id} />

      {children}
    </div>
  );
}
