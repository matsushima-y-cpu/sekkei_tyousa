import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">新規プロジェクト作成</h2>
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>物件の基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Supabase接続後に入力フォームが表示されます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
