export const dynamic = "force-dynamic";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      prefecture: true,
      items: {
        orderBy: (items, { asc }) => [asc(items.sortOrder)],
      },
    },
  });

  if (!project) {
    notFound();
  }

  const selectedItems = project.items.filter((item) => item.isSelected);
  const totalSellingPrice = selectedItems.reduce(
    (sum, item) => sum + item.sellingPrice * Number(item.quantity),
    0
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <InfoRow label="物件名称" value={project.propertyName} />
            <InfoRow label="顧客名" value={project.customerName} />
            <InfoRow label="プロジェクト番号" value={project.projectNumber} />
            <InfoRow
              label="所在地"
              value={[
                project.prefecture?.name,
                project.municipality,
                project.lotNumber,
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <InfoRow label="住居表示" value={project.addressDisplay} />
            <InfoRow label="見積番号" value={project.estimateNumber} />
            <InfoRow
              label="見積日"
              value={
                project.estimateDate
                  ? new Date(project.estimateDate).toLocaleDateString("ja-JP")
                  : null
              }
            />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>都市計画情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <InfoRow
              label="敷地面積"
              value={project.siteArea ? `${project.siteArea} ㎡` : null}
            />
            <InfoRow label="建物規模" value={project.buildingScale} />
            <InfoRow label="都市計画区域" value={project.cityPlanningZone} />
            <InfoRow label="防火指定" value={project.firePrevention} />
            <InfoRow label="用途地域" value={project.zoning} />
            <InfoRow label="高度地区" value={project.heightDistrict} />
            <InfoRow
              label="建蔽率"
              value={
                project.buildingCoverage
                  ? `${project.buildingCoverage}%`
                  : null
              }
            />
            <InfoRow
              label="容積率"
              value={
                project.floorAreaRatio ? `${project.floorAreaRatio}%` : null
              }
            />
          </dl>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>見積概要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">選択項目数</p>
              <p className="text-2xl font-bold">{selectedItems.length}件</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">登録項目数</p>
              <p className="text-2xl font-bold">{project.items.length}件</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">見積合計（税抜）</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("ja-JP", {
                  style: "currency",
                  currency: "JPY",
                  minimumFractionDigits: 0,
                }).format(totalSellingPrice)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {project.notes && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>備考</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "-"}</dd>
    </div>
  );
}
