import { notFound } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">プロジェクト詳細</h2>
      <p className="text-muted-foreground">プロジェクトID: {id}</p>
    </div>
  );
}
