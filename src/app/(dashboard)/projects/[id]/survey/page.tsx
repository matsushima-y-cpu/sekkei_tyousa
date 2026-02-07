import { SurveyForm } from "@/components/survey-form";

export default async function ProjectSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SurveyForm projectId={id} />;
}
