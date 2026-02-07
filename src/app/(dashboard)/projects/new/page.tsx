import { ProjectSurveyForm } from "@/components/project-survey-form";

export default function NewProjectPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">新規調査書作成</h2>
      <ProjectSurveyForm />
    </div>
  );
}
