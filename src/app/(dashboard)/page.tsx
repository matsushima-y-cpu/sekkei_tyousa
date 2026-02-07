export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, FileCheck, Clock, AlertTriangle } from "lucide-react";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

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

export default async function DashboardPage() {
  const [statsRows, recentProjects] = await Promise.all([
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

  for (const row of statsRows) {
    statusCounts[row.status] = Number(row.count);
  }

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const stats = [
    {
      title: "全プロジェクト",
      value: String(total),
      description: "登録済み案件数",
      icon: FolderOpen,
    },
    {
      title: "調査中",
      value: String(statusCounts.investigating),
      description: "現在進行中",
      icon: Clock,
    },
    {
      title: "見積済",
      value: String(statusCounts.estimated),
      description: "見積完了件数",
      icon: FileCheck,
    },
    {
      title: "下書き",
      value: String(statusCounts.draft),
      description: "未着手案件",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近のプロジェクト</CardTitle>
          <CardDescription>直近の案件が表示されます</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              プロジェクトが登録されていません。
            </p>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {project.propertyName}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {project.municipality || "-"}
                      {project.customerName
                        ? ` / ${project.customerName}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        STATUS_VARIANTS[project.status] || "outline"
                      }
                    >
                      {STATUS_LABELS[project.status] || project.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
