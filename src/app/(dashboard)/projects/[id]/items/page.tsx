export default async function ProjectItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">調査項目選択</h2>
      <p className="text-muted-foreground">プロジェクト {id} の調査項目を選択します。</p>
    </div>
  );
}
