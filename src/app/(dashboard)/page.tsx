import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen, FileCheck, Clock, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "全プロジェクト",
      value: "0",
      description: "登録済み案件数",
      icon: FolderOpen,
    },
    {
      title: "調査中",
      value: "0",
      description: "現在進行中",
      icon: Clock,
    },
    {
      title: "見積済",
      value: "0",
      description: "見積完了件数",
      icon: FileCheck,
    },
    {
      title: "下書き",
      value: "0",
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
          <p className="text-sm text-muted-foreground">
            プロジェクトが登録されていません。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
