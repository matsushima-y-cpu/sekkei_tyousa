"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SurveyData {
  [key: string]: string | boolean | number | null | undefined;
}

interface SurveyFormProps {
  projectId: string;
}

export function SurveyForm({ projectId }: SurveyFormProps) {
  const [form, setForm] = useState<SurveyData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/survey`)
      .then((res) => res.json())
      .then((data: SurveyData | null) => {
        if (data) setForm(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/survey`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      toast.success("調査書を保存しました");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">読み込み中...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 都市計画関連 */}
      <Card>
        <CardHeader>
          <CardTitle>都市計画関連</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>地区計画</Label>
              <Input
                value={(form.districtPlan as string) || ""}
                onChange={(e) => updateField("districtPlan", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>地区計画 備考</Label>
              <Input
                value={(form.districtPlanNotes as string) || ""}
                onChange={(e) => updateField("districtPlanNotes", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>建築協定</Label>
              <Input
                value={(form.buildingAgreement as string) || ""}
                onChange={(e) => updateField("buildingAgreement", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>建築協定 備考</Label>
              <Input
                value={(form.buildingAgreementNotes as string) || ""}
                onChange={(e) => updateField("buildingAgreementNotes", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>景観</Label>
              <Input
                value={(form.landscape as string) || ""}
                onChange={(e) => updateField("landscape", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>景観 備考</Label>
              <Input
                value={(form.landscapeNotes as string) || ""}
                onChange={(e) => updateField("landscapeNotes", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>埋蔵文化財</Label>
              <Input
                value={(form.buriedCultural as string) || ""}
                onChange={(e) => updateField("buriedCultural", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>埋蔵文化財 備考</Label>
              <Input
                value={(form.buriedCulturalNotes as string) || ""}
                onChange={(e) => updateField("buriedCulturalNotes", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 道路情報 */}
      <Card>
        <CardHeader>
          <CardTitle>道路情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n}>
              {n > 1 && <Separator className="mb-4" />}
              <p className="text-sm font-medium mb-3">道路 {n}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>種別</Label>
                  <Input
                    value={(form[`road${n}Type`] as string) || ""}
                    onChange={(e) => updateField(`road${n}Type`, e.target.value)}
                    placeholder="例: 市道"
                  />
                </div>
                <div className="space-y-2">
                  <Label>方角</Label>
                  <Input
                    value={(form[`road${n}Side`] as string) || ""}
                    onChange={(e) => updateField(`road${n}Side`, e.target.value)}
                    placeholder="例: 南側"
                  />
                </div>
                <div className="space-y-2">
                  <Label>路線名</Label>
                  <Input
                    value={(form[`road${n}Name`] as string) || ""}
                    onChange={(e) => updateField(`road${n}Name`, e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>性格</Label>
                  <Input
                    value={(form[`road${n}Character`] as string) || ""}
                    onChange={(e) => updateField(`road${n}Character`, e.target.value)}
                    placeholder="例: 42条1項1号"
                  />
                </div>
                <div className="space-y-2">
                  <Label>幅員（m）</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(form[`road${n}Width`] as string) || ""}
                    onChange={(e) => updateField(`road${n}Width`, e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>官民境界</Label>
                  <Input
                    value={(form[`road${n}Demarcation`] as string) || ""}
                    onChange={(e) => updateField(`road${n}Demarcation`, e.target.value)}
                    placeholder="例: 確定済"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* インフラ */}
      <Card>
        <CardHeader>
          <CardTitle>インフラ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>公共下水道</Label>
              <Input
                value={(form.publicSewerage as string) || ""}
                onChange={(e) => updateField("publicSewerage", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sewerageLedger"
                  checked={!!form.sewerageLedger}
                  onCheckedChange={(checked) =>
                    updateField("sewerageLedger", !!checked)
                  }
                />
                <Label htmlFor="sewerageLedger">台帳あり</Label>
              </div>
              <Input
                placeholder="下水 備考"
                value={(form.sewerageNotes as string) || ""}
                onChange={(e) => updateField("sewerageNotes", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>上水道</Label>
              <Input
                value={(form.waterSupply as string) || ""}
                onChange={(e) => updateField("waterSupply", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="waterLedger"
                  checked={!!form.waterLedger}
                  onCheckedChange={(checked) =>
                    updateField("waterLedger", !!checked)
                  }
                />
                <Label htmlFor="waterLedger">台帳あり</Label>
              </div>
              <Input
                placeholder="上水 備考"
                value={(form.waterNotes as string) || ""}
                onChange={(e) => updateField("waterNotes", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ガス</Label>
              <Input
                value={(form.gas as string) || ""}
                onChange={(e) => updateField("gas", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ガス 備考</Label>
              <Input
                value={(form.gasNotes as string) || ""}
                onChange={(e) => updateField("gasNotes", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 規制・災害 */}
      <Card>
        <CardHeader>
          <CardTitle>規制・災害関連</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>景観地区</Label>
              <Input
                value={(form.scenicDistrict as string) || ""}
                onChange={(e) => updateField("scenicDistrict", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>景観地区 備考</Label>
              <Input
                value={(form.scenicNotes as string) || ""}
                onChange={(e) => updateField("scenicNotes", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>壁面後退（道路側）</Label>
              <Input
                value={(form.wallSetbackRoad as string) || ""}
                onChange={(e) => updateField("wallSetbackRoad", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>壁面後退（隣地側）</Label>
              <Input
                value={(form.wallSetbackAdjacent as string) || ""}
                onChange={(e) => updateField("wallSetbackAdjacent", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>擁壁規制</Label>
              <Input
                value={(form.retainingWallRegulation as string) || ""}
                onChange={(e) => updateField("retainingWallRegulation", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>擁壁 備考</Label>
              <Input
                value={(form.retainingWallNotes as string) || ""}
                onChange={(e) => updateField("retainingWallNotes", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>砂防指定</Label>
              <Input
                value={(form.sedimentControl as string) || ""}
                onChange={(e) => updateField("sedimentControl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>砂防 備考</Label>
              <Input
                value={(form.sedimentNotes as string) || ""}
                onChange={(e) => updateField("sedimentNotes", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>河川保全区域</Label>
              <Input
                value={(form.riverConservation as string) || ""}
                onChange={(e) => updateField("riverConservation", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>河川幅（m）</Label>
              <Input
                type="number"
                step="0.01"
                value={(form.riverWidth as string) || ""}
                onChange={(e) => updateField("riverWidth", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>河川 備考</Label>
              <Input
                value={(form.riverNotes as string) || ""}
                onChange={(e) => updateField("riverNotes", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>地すべり</Label>
              <Input
                value={(form.landslide as string) || ""}
                onChange={(e) => updateField("landslide", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>急傾斜地</Label>
              <Input
                value={(form.steepSlope as string) || ""}
                onChange={(e) => updateField("steepSlope", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>災害警戒区域</Label>
            <Input
              value={(form.disasterWarning as string) || ""}
              onChange={(e) => updateField("disasterWarning", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* その他 */}
      <Card>
        <CardHeader>
          <CardTitle>その他</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>消防署</Label>
              <Input
                value={(form.fireDepartment as string) || ""}
                onChange={(e) => updateField("fireDepartment", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>中間検査</Label>
              <Input
                value={(form.intermediateInspection as string) || ""}
                onChange={(e) => updateField("intermediateInspection", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>高層関連</Label>
              <Input
                value={(form.highriseRelated as string) || ""}
                onChange={(e) => updateField("highriseRelated", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>開発指導要綱</Label>
              <Input
                value={(form.developmentGuidelines as string) || ""}
                onChange={(e) => updateField("developmentGuidelines", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>都市計画施設</Label>
            <Input
              value={(form.cityPlanningFacility as string) || ""}
              onChange={(e) => updateField("cityPlanningFacility", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>その他メモ</Label>
            <Textarea
              value={(form.extraNotes as string) || ""}
              onChange={(e) => updateField("extraNotes", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
