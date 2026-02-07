"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PrefectureMunicipalitySelect } from "@/components/prefecture-municipality-select";
import { toast } from "sonner";

const FIRE_PREVENTION_OPTIONS = [
  "準防火地域",
  "防火地域",
  "法22条地域",
  "指定なし",
];

const ZONING_OPTIONS = [
  "第一種低層住居専用地域",
  "第二種低層住居専用地域",
  "第一種中高層住居専用地域",
  "第二種中高層住居専用地域",
  "第一種住居地域",
  "第二種住居地域",
  "準住居地域",
  "近隣商業地域",
  "商業地域",
  "準工業地域",
  "工業地域",
  "工業専用地域",
];

interface ProjectFormProps {
  initialData?: {
    id?: string;
    propertyName?: string;
    prefectureId?: number | null;
    municipality?: string | null;
    lotNumber?: string | null;
    addressDisplay?: string | null;
    siteArea?: string | null;
    buildingScale?: string | null;
    cityPlanningZone?: string | null;
    firePrevention?: string | null;
    zoning?: string | null;
    heightDistrict?: string | null;
    buildingCoverage?: string | null;
    floorAreaRatio?: string | null;
    customerName?: string | null;
    notes?: string | null;
  };
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [form, setForm] = useState({
    propertyName: initialData?.propertyName || "",
    prefectureId: initialData?.prefectureId ? String(initialData.prefectureId) : "",
    municipality: initialData?.municipality || "",
    lotNumber: initialData?.lotNumber || "",
    addressDisplay: initialData?.addressDisplay || "",
    siteArea: initialData?.siteArea || "",
    buildingScale: initialData?.buildingScale || "",
    cityPlanningZone: initialData?.cityPlanningZone || "",
    firePrevention: initialData?.firePrevention || "",
    zoning: initialData?.zoning || "",
    heightDistrict: initialData?.heightDistrict || "",
    buildingCoverage: initialData?.buildingCoverage || "",
    floorAreaRatio: initialData?.floorAreaRatio || "",
    customerName: initialData?.customerName || "",
    notes: initialData?.notes || "",
  });

  const [saving, setSaving] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.propertyName.trim()) {
      toast.error("物件名称を入力してください");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/projects/${initialData.id}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          prefectureId: form.prefectureId ? Number(form.prefectureId) : null,
          siteArea: form.siteArea ? Number(form.siteArea) : null,
          buildingCoverage: form.buildingCoverage ? Number(form.buildingCoverage) : null,
          floorAreaRatio: form.floorAreaRatio ? Number(form.floorAreaRatio) : null,
        }),
      });

      if (!res.ok) throw new Error("保存に失敗しました");

      const project = await res.json() as { id: string };
      toast.success(isEdit ? "更新しました" : "作成しました");
      router.push(`/projects/${project.id}`);
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>物件の基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">物件名称 *</Label>
              <Input
                id="propertyName"
                value={form.propertyName}
                onChange={(e) => updateField("propertyName", e.target.value)}
                placeholder="例: Gハウス太郎様邸　新築工事"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">顧客名</Label>
              <Input
                id="customerName"
                value={form.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                placeholder="見積書の宛先"
              />
            </div>
          </div>

          <Separator />

          <PrefectureMunicipalitySelect
            prefectureId={form.prefectureId}
            municipality={form.municipality}
            onPrefectureChange={(v) => {
              updateField("prefectureId", v);
              updateField("municipality", "");
            }}
            onMunicipalityChange={(v) => updateField("municipality", v)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lotNumber">地番</Label>
              <Input
                id="lotNumber"
                value={form.lotNumber}
                onChange={(e) => updateField("lotNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressDisplay">住居表示</Label>
              <Input
                id="addressDisplay"
                value={form.addressDisplay}
                onChange={(e) => updateField("addressDisplay", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>都市計画情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteArea">敷地面積（㎡）</Label>
              <Input
                id="siteArea"
                type="number"
                step="0.01"
                value={form.siteArea}
                onChange={(e) => updateField("siteArea", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buildingScale">建物規模</Label>
              <Input
                id="buildingScale"
                value={form.buildingScale}
                onChange={(e) => updateField("buildingScale", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cityPlanningZone">都市計画区域</Label>
              <Input
                id="cityPlanningZone"
                value={form.cityPlanningZone}
                onChange={(e) => updateField("cityPlanningZone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>防火指定</Label>
              <Select
                value={form.firePrevention}
                onValueChange={(v) => updateField("firePrevention", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {FIRE_PREVENTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>用途地域</Label>
              <Select
                value={form.zoning}
                onValueChange={(v) => updateField("zoning", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {ZONING_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heightDistrict">高度地区</Label>
              <Input
                id="heightDistrict"
                value={form.heightDistrict}
                onChange={(e) => updateField("heightDistrict", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buildingCoverage">建蔽率（％）</Label>
              <Input
                id="buildingCoverage"
                type="number"
                step="0.01"
                value={form.buildingCoverage}
                onChange={(e) =>
                  updateField("buildingCoverage", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floorAreaRatio">容積率（％）</Label>
              <Input
                id="floorAreaRatio"
                type="number"
                step="0.01"
                value={form.floorAreaRatio}
                onChange={(e) => updateField("floorAreaRatio", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>備考</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="備考欄"
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "保存中..." : isEdit ? "更新" : "作成"}
        </Button>
      </div>
    </form>
  );
}
