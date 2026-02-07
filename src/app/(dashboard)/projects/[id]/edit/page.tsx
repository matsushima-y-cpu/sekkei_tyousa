export const dynamic = "force-dynamic";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProjectSurveyForm } from "@/components/project-survey-form";

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProjectSurveyForm
        initialProject={{
          id: project.id,
          propertyName: project.propertyName,
          prefectureId: project.prefectureId,
          municipality: project.municipality,
          lotNumber: project.lotNumber,
          addressDisplay: project.addressDisplay,
          siteArea: project.siteArea,
          buildingScale: project.buildingScale,
          cityPlanningZone: project.cityPlanningZone,
          firePrevention: project.firePrevention,
          zoning: project.zoning,
          heightDistrict: project.heightDistrict,
          buildingCoverage: project.buildingCoverage,
          floorAreaRatio: project.floorAreaRatio,
          customerName: project.customerName,
          notes: project.notes,
        }}
      />
    </div>
  );
}
