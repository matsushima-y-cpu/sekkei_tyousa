"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Prefecture {
  id: number;
  code: number;
  name: string;
  shortName: string;
}

interface Municipality {
  id: number;
  prefectureId: number;
  name: string;
}

interface PrefectureMunicipalitySelectProps {
  prefectureId: string;
  municipality: string;
  onPrefectureChange: (prefectureId: string) => void;
  onMunicipalityChange: (municipality: string) => void;
}

export function PrefectureMunicipalitySelect({
  prefectureId,
  municipality,
  onPrefectureChange,
  onMunicipalityChange,
}: PrefectureMunicipalitySelectProps) {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  useEffect(() => {
    fetch("/api/prefectures")
      .then((res) => res.json())
      .then((data: Prefecture[]) => setPrefectures(data))
      .catch(() => setPrefectures([]));
  }, []);

  useEffect(() => {
    if (!prefectureId) {
      setMunicipalities([]);
      return;
    }
    setLoadingMunicipalities(true);
    fetch(`/api/prefectures/${prefectureId}/municipalities`)
      .then((res) => res.json())
      .then((data: Municipality[]) => {
        setMunicipalities(data);
        setLoadingMunicipalities(false);
      })
      .catch(() => {
        setMunicipalities([]);
        setLoadingMunicipalities(false);
      });
  }, [prefectureId]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>都道府県</Label>
        <Select value={prefectureId} onValueChange={onPrefectureChange}>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {prefectures.map((pref) => (
              <SelectItem key={pref.id} value={String(pref.id)}>
                {pref.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>市区町村</Label>
        <Select
          value={municipality}
          onValueChange={onMunicipalityChange}
          disabled={!prefectureId || loadingMunicipalities}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                loadingMunicipalities ? "読み込み中..." : "選択してください"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {municipalities.map((mun) => (
              <SelectItem key={mun.id} value={mun.name}>
                {mun.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
