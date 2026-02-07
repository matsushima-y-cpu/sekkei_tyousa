"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectList } from "@/components/project-list";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">プロジェクト一覧</h2>
          <p className="text-muted-foreground">案件の管理・検索</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規調査書作成
          </Button>
        </Link>
      </div>
      <ProjectList />
    </div>
  );
}
