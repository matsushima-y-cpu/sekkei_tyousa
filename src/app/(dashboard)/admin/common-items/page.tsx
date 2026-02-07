import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCommonItemsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">共通項目マスタ</h2>
      <Card>
        <CardHeader>
          <CardTitle>共通項目一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            全プロジェクト共通の調査項目マスタです。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
