export default async function ProjectEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">見積プレビュー</h2>
      <p className="text-muted-foreground">プロジェクト {id} の見積書を確認します。</p>
    </div>
  );
}
