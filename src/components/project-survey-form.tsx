"use client";

import { useState, useEffect } from "react";
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

// === Excel準拠プルダウン選択肢 ===

const CITY_PLANNING_ZONE = ["-", "市街化区域", "市街化調整区域", "都市計画区域外", "区域区分されていない地域"];
const FIRE_PREVENTION = ["法22条地域", "準防火地域", "防火地域", "指定なし"];
const ZONING = [
  "第一種低層住居専用地域", "第二種低層住居専用地域",
  "第一種住居地域", "第二種住居地域", "準住居地域",
  "第一種中高層住居専用地域", "第二種中高層住居専用地域",
  "準工業地域", "工業専用地域", "工業地域",
  "商業地域", "近隣商業地域", "田園住居地域",
];
const BUILDING_SCALE = ["平屋", "木2", "木3"];
const SETBACK_DISTANCE = ["無", "500㎜", "750㎜", "1000㎜", "1500㎜", "1800㎜", "2000㎜"];
const WALL_SETBACK = ["1000㎜", "1500㎜", "1800㎜", "2000㎜", "3000㎜"];
const HEIGHT_DISTRICT = ["高度地区無し", "第（）種"];
const DIRECTION = ["北側", "西側", "東側", "南側", "---側"];
const SLOPE_START = ["5", "7.5", "10"];
const SLOPE_RATIO = ["1.25", "0.6"];
const COVERAGE_RATIO = ["10", "20", "30", "40", "50", "60", "70", "80", "按分(用途地域跨ぎのため)"];
const FLOOR_AREA_RATIO = ["20", "40", "50", "60", "80", "100", "150", "200", "300", "400", "500", "按分(用途地域跨ぎのため)"];
const IN_OUT = ["内", "外"];
const LANDSCAPE = ["外", "内：届出不要", "内：届出必要"];
const ROAD_TYPE = [
  "法42条1項一号", "法42条1項二号", "法42条1項三号", "法42条1項四号", "法42条1項五号",
  "法42条2項(中心後退、4m)", "法42条2項(一方後退､4m)", "法42条3項",
  "法42条4項(中心後退、6m)", "法42条4項(一方後退、6m)",
  "法43条1項2号", "法43条2項1号", "法43条2項2号",
];
const ROAD_CHARACTER = ["公道", "私道", "未判定道路", "非該当道路", "里道", "水路"];
const ROAD_DEMARCATION = ["-", "有", "無"];
const SEWERAGE = ["有", "無　浄化槽設置必要"];
const SEWERAGE_TYPE = ["合流式", "分流式"];
const WATER_SUPPLY = ["有", "無", "増径必要", "不明"];
const YES_NO = ["有", "無"];
const GAS_STATUS = ["調査済", "未調査", "重要事項説明書に記載有"];
const DISASTER_WARNING = ["無", "赤", "黄"];
const FIRE_DEPT = ["消火栓", "防火水槽"];
const INSPECTION_COUNT = ["1回", "2回"];
const APPLICABLE = ["該当", "無"];
const SITE_AREA_TYPE = ["公簿", "-"];

// === 型定義 ===

interface SurveyData {
  [key: string]: string | boolean | number | null | undefined;
}

interface ProjectSurveyFormProps {
  initialProject?: {
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

// === ヘルパー ===

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "選択"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// === メインコンポーネント ===

export function ProjectSurveyForm({ initialProject }: ProjectSurveyFormProps) {
  const router = useRouter();
  const isEdit = !!initialProject?.id;

  const [project, setProject] = useState({
    propertyName: initialProject?.propertyName || "",
    prefectureId: initialProject?.prefectureId ? String(initialProject.prefectureId) : "",
    municipality: initialProject?.municipality || "",
    lotNumber: initialProject?.lotNumber || "",
    addressDisplay: initialProject?.addressDisplay || "",
    siteArea: initialProject?.siteArea || "",
    buildingScale: initialProject?.buildingScale || "",
    cityPlanningZone: initialProject?.cityPlanningZone || "",
    firePrevention: initialProject?.firePrevention || "",
    zoning: initialProject?.zoning || "",
    heightDistrict: initialProject?.heightDistrict || "",
    buildingCoverage: initialProject?.buildingCoverage || "",
    floorAreaRatio: initialProject?.floorAreaRatio || "",
    customerName: initialProject?.customerName || "",
    notes: initialProject?.notes || "",
  });

  const [survey, setSurvey] = useState<SurveyData>({});
  const [saving, setSaving] = useState(false);
  const [loadingSurvey, setLoadingSurvey] = useState(false);

  useEffect(() => {
    if (isEdit && initialProject?.id) {
      setLoadingSurvey(true);
      fetch(`/api/projects/${initialProject.id}/survey`)
        .then((res) => res.json())
        .then((data: SurveyData | null) => { if (data) setSurvey(data); })
        .catch(() => {})
        .finally(() => setLoadingSurvey(false));
    }
  }, [isEdit, initialProject?.id]);

  function up(field: string, value: string) {
    setProject((prev) => ({ ...prev, [field]: value }));
  }
  function us(field: string, value: string) {
    setSurvey((prev) => ({ ...prev, [field]: value }));
  }
  const sv = (f: string) => (survey[f] as string) || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!project.propertyName.trim()) {
      toast.error("物件名称を入力してください");
      return;
    }
    setSaving(true);
    try {
      const projectUrl = isEdit ? `/api/projects/${initialProject!.id}` : "/api/projects";
      const projectRes = await fetch(projectUrl, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...project,
          prefectureId: project.prefectureId ? Number(project.prefectureId) : null,
        }),
      });
      if (!projectRes.ok) throw new Error("保存失敗");
      const savedProject = await projectRes.json() as { id: string };

      const surveyRes = await fetch(`/api/projects/${savedProject.id}/survey`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(survey),
      });
      if (!surveyRes.ok) throw new Error("調査書保存失敗");

      toast.success(isEdit ? "更新しました" : "作成しました");
      router.push(`/projects/${savedProject.id}`);
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  if (loadingSurvey) {
    return <p className="text-center text-muted-foreground py-8">読み込み中...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ===== 基本情報 ===== */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>物件の基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">物件名称 *</Label>
              <Input id="propertyName" value={project.propertyName} onChange={(e) => up("propertyName", e.target.value)} placeholder="例: Gハウス太郎様邸　新築工事" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">顧客名</Label>
              <Input id="customerName" value={project.customerName} onChange={(e) => up("customerName", e.target.value)} placeholder="見積書の宛先" />
            </div>
          </div>
          <Separator />
          <PrefectureMunicipalitySelect
            prefectureId={project.prefectureId}
            municipality={project.municipality}
            onPrefectureChange={(v) => { up("prefectureId", v); up("municipality", ""); }}
            onMunicipalityChange={(v) => up("municipality", v)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lotNumber">地番</Label>
              <Input id="lotNumber" value={project.lotNumber} onChange={(e) => up("lotNumber", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressDisplay">住居表示</Label>
              <Input id="addressDisplay" value={project.addressDisplay} onChange={(e) => up("addressDisplay", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== 都市計画情報 ===== */}
      <Card>
        <CardHeader><CardTitle>都市計画情報</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>敷地面積（㎡）</Label>
              <div className="flex gap-2">
                <Input type="number" step="0.01" value={project.siteArea} onChange={(e) => up("siteArea", e.target.value)} className="flex-1" />
                <Select value={sv("siteAreaType")} onValueChange={(v) => us("siteAreaType", v)}>
                  <SelectTrigger className="w-24"><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    {SITE_AREA_TYPE.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SelectField label="建物規模" value={project.buildingScale} onChange={(v) => up("buildingScale", v)} options={BUILDING_SCALE} />
            <SelectField label="都市計画区域" value={project.cityPlanningZone} onChange={(v) => up("cityPlanningZone", v)} options={CITY_PLANNING_ZONE} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="防火指定" value={project.firePrevention} onChange={(v) => up("firePrevention", v)} options={FIRE_PREVENTION} />
            <SelectField label="用途地域" value={project.zoning} onChange={(v) => up("zoning", v)} options={ZONING} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="外壁後退" value={sv("wallSetbackRoad")} onChange={(v) => us("wallSetbackRoad", v)} options={SETBACK_DISTANCE} />
            <div className="space-y-2">
              <Label>外壁後退 備考</Label>
              <Input value={sv("wallSetbackAdjacent")} onChange={(e) => us("wallSetbackAdjacent", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <SelectField label="高度地区" value={project.heightDistrict} onChange={(v) => up("heightDistrict", v)} options={HEIGHT_DISTRICT} />
            <SelectField label="北側" value={sv("heightDirection")} onChange={(v) => us("heightDirection", v)} options={DIRECTION} />
            <SelectField label="mから" value={sv("heightSlopeStart")} onChange={(v) => us("heightSlopeStart", v)} options={SLOPE_START} />
            <SelectField label="勾配" value={sv("heightSlopeRatio")} onChange={(v) => us("heightSlopeRatio", v)} options={SLOPE_RATIO} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="建蔽率（％）" value={project.buildingCoverage} onChange={(v) => up("buildingCoverage", v)} options={COVERAGE_RATIO} />
            <SelectField label="容積率（％）" value={project.floorAreaRatio} onChange={(v) => up("floorAreaRatio", v)} options={FLOOR_AREA_RATIO} />
          </div>
        </CardContent>
      </Card>

      {/* ===== 各種区域等 ===== */}
      <Card>
        <CardHeader><CardTitle>各種区域等</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="地区計画" value={sv("districtPlan")} onChange={(v) => us("districtPlan", v)} options={IN_OUT} />
            <div className="space-y-2 col-span-2">
              <Label>備考</Label>
              <Input value={sv("districtPlanNotes")} onChange={(e) => us("districtPlanNotes", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="建築協定" value={sv("buildingAgreement")} onChange={(v) => us("buildingAgreement", v)} options={IN_OUT} />
            <div className="space-y-2 col-span-2">
              <Label>備考</Label>
              <Input value={sv("buildingAgreementNotes")} onChange={(e) => us("buildingAgreementNotes", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="景観" value={sv("landscape")} onChange={(v) => us("landscape", v)} options={LANDSCAPE} />
            <div className="space-y-2 col-span-2">
              <Label>備考</Label>
              <Input value={sv("landscapeNotes")} onChange={(e) => us("landscapeNotes", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="埋蔵文化財" value={sv("buriedCultural")} onChange={(v) => us("buriedCultural", v)} options={IN_OUT} />
            <div className="space-y-2 col-span-2">
              <Label>備考</Label>
              <Input value={sv("buriedCulturalNotes")} onChange={(e) => us("buriedCulturalNotes", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== 接続道路 ===== */}
      <Card>
        <CardHeader><CardTitle>接続道路</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n}>
              {n > 1 && <Separator className="mb-4" />}
              <p className="text-sm font-medium mb-3">道路 {n}</p>
              <div className="grid grid-cols-3 gap-4">
                <SelectField label="道路種別" value={sv(`road${n}Type`)} onChange={(v) => us(`road${n}Type`, v)} options={ROAD_TYPE} />
                <SelectField label="性格" value={sv(`road${n}Character`)} onChange={(v) => us(`road${n}Character`, v)} options={ROAD_CHARACTER} />
                <SelectField label="明示" value={sv(`road${n}Demarcation`)} onChange={(v) => us(`road${n}Demarcation`, v)} options={ROAD_DEMARCATION} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <SelectField label="方角" value={sv(`road${n}Side`)} onChange={(v) => us(`road${n}Side`, v)} options={DIRECTION} />
                <div className="space-y-2">
                  <Label>路線名又は指定年月日・番号</Label>
                  <Input value={sv(`road${n}Name`)} onChange={(e) => us(`road${n}Name`, e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>幅員（m）</Label>
                  <Input type="number" step="0.01" value={sv(`road${n}Width`)} onChange={(e) => us(`road${n}Width`, e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ===== インフラ ===== */}
      <Card>
        <CardHeader><CardTitle>インフラ</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* 公共下水道 */}
          <div className="grid grid-cols-4 gap-4">
            <SelectField label="公共下水道" value={sv("publicSewerage")} onChange={(v) => us("publicSewerage", v)} options={SEWERAGE} />
            <SelectField label="方式" value={sv("sewerageType")} onChange={(v) => us("sewerageType", v)} options={SEWERAGE_TYPE} />
            <SelectField label="行政台帳写し" value={sv("sewerageLedger")} onChange={(v) => us("sewerageLedger", v)} options={YES_NO} />
            <div className="space-y-2">
              <Label>備考</Label>
              <Input value={sv("sewerageNotes")} onChange={(e) => us("sewerageNotes", e.target.value)} />
            </div>
          </div>
          {/* 水道 */}
          <div className="grid grid-cols-4 gap-4">
            <SelectField label="水道" value={sv("waterSupply")} onChange={(v) => us("waterSupply", v)} options={WATER_SUPPLY} />
            <div className="space-y-2">
              <Label>口径</Label>
              <Input value={sv("waterDiameter")} onChange={(e) => us("waterDiameter", e.target.value)} placeholder="㎜" />
            </div>
            <SelectField label="行政台帳写し" value={sv("waterLedger")} onChange={(v) => us("waterLedger", v)} options={YES_NO} />
            <div className="space-y-2">
              <Label>備考</Label>
              <Input value={sv("waterNotes")} onChange={(e) => us("waterNotes", e.target.value)} />
            </div>
          </div>
          {/* ガス */}
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="ガス" value={sv("gas")} onChange={(v) => us("gas", v)} options={YES_NO} />
            <SelectField label="調査状況" value={sv("gasStatus")} onChange={(v) => us("gasStatus", v)} options={GAS_STATUS} />
            <div className="space-y-2">
              <Label>備考</Label>
              <Input value={sv("gasNotes")} onChange={(e) => us("gasNotes", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== 規制・災害関連 ===== */}
      <Card>
        <CardHeader><CardTitle>規制・災害関連</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="風致地区" value={sv("scenicDistrict")} onChange={(v) => us("scenicDistrict", v)} options={IN_OUT} />
            <SelectField label="壁面後退 道路側" value={sv("scenicWallRoad")} onChange={(v) => us("scenicWallRoad", v)} options={WALL_SETBACK} />
            <SelectField label="壁面後退 隣地側" value={sv("scenicWallAdjacent")} onChange={(v) => us("scenicWallAdjacent", v)} options={WALL_SETBACK} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="宅造 規制区域" value={sv("retainingWallRegulation")} onChange={(v) => us("retainingWallRegulation", v)} options={IN_OUT} />
            <div className="space-y-2 col-span-2">
              <Label>備考</Label>
              <Input value={sv("retainingWallNotes")} onChange={(e) => us("retainingWallNotes", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="砂防 規制区域" value={sv("sedimentControl")} onChange={(v) => us("sedimentControl", v)} options={IN_OUT} />
            <div className="space-y-2 col-span-2">
              <Label>備考</Label>
              <Input value={sv("sedimentNotes")} onChange={(e) => us("sedimentNotes", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <SelectField label="河川保全区域" value={sv("riverConservation")} onChange={(v) => us("riverConservation", v)} options={IN_OUT} />
            <div className="space-y-2">
              <Label>区域幅（m）</Label>
              <Input type="number" step="0.01" value={sv("riverWidth")} onChange={(e) => us("riverWidth", e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>備考</Label>
              <Input value={sv("riverNotes")} onChange={(e) => us("riverNotes", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <SelectField label="地すべり" value={sv("landslide")} onChange={(v) => us("landslide", v)} options={YES_NO} />
            <SelectField label="急傾斜" value={sv("steepSlope")} onChange={(v) => us("steepSlope", v)} options={YES_NO} />
            <SelectField label="土砂災害警戒区域" value={sv("disasterWarning")} onChange={(v) => us("disasterWarning", v)} options={DISASTER_WARNING} />
            <div className="space-y-2">
              <Label>備考</Label>
              <Input value={sv("scenicNotes")} onChange={(e) => us("scenicNotes", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== その他 ===== */}
      <Card>
        <CardHeader><CardTitle>その他</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <SelectField label="消防" value={sv("fireDepartment")} onChange={(v) => us("fireDepartment", v)} options={FIRE_DEPT} />
            <div className="space-y-2">
              <Label>距離（t）</Label>
              <Input value={sv("fireDepartmentDistance")} onChange={(e) => us("fireDepartmentDistance", e.target.value)} />
            </div>
            <SelectField label="中間検査" value={sv("intermediateInspection")} onChange={(v) => us("intermediateInspection", v)} options={YES_NO} />
            <SelectField label="検査回数" value={sv("inspectionCount")} onChange={(v) => us("inspectionCount", v)} options={INSPECTION_COUNT} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="中高層関係" value={sv("highriseRelated")} onChange={(v) => us("highriseRelated", v)} options={APPLICABLE} />
            <SelectField label="開発指導要綱" value={sv("developmentGuidelines")} onChange={(v) => us("developmentGuidelines", v)} options={APPLICABLE} />
            <SelectField label="都市計画施設" value={sv("cityPlanningFacility")} onChange={(v) => us("cityPlanningFacility", v)} options={IN_OUT} />
          </div>
          <div className="space-y-2">
            <Label>備考</Label>
            <Textarea
              value={sv("extraNotes") || project.notes}
              onChange={(e) => { us("extraNotes", e.target.value); up("notes", e.target.value); }}
              placeholder="備考欄"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ===== 送信 ===== */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>キャンセル</Button>
        <Button type="submit" disabled={saving}>
          {saving ? "保存中..." : isEdit ? "更新" : "作成"}
        </Button>
      </div>
    </form>
  );
}
