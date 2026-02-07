import { EstimatePreview } from "@/components/estimate-preview";

export default async function ProjectEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EstimatePreview projectId={id} />;
}
