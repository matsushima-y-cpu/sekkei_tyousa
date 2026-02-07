import { ProjectForm } from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">新規プロジェクト作成</h2>
      <ProjectForm />
    </div>
  );
}
