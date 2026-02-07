import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminItemsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">調査項目マスタ</h2>
      <Card>
        <CardHeader>
          <CardTitle>調査項目一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            都道府県・市区町村別の調査項目マスタデータです。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
