export default async function ProjectSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">役所調査書</h2>
      <p className="text-muted-foreground">プロジェクト {id} の調査書を入力します。</p>
    </div>
  );
}
