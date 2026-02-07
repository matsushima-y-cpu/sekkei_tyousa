import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "下書き",
  investigating: "調査中",
  estimated: "見積済",
  completed: "完了",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  investigating: "default",
  estimated: "secondary",
  completed: "default",
};

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
            新規作成
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>プロジェクト</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            プロジェクトが登録されていません。「新規作成」から案件を追加してください。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
