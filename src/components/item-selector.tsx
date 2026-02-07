"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface MasterItem {
  id: number;
  description: string;
  quantity: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  daysBeforeConstruction: number | null;
}

interface ProjectItem {
  id: string;
  sourceItemId: number | null;
  description: string;
  quantity: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  isSelected: boolean;
  sortOrder: number;
  notes: string | null;
}

interface ItemSelectorProps {
  projectId: string;
  prefectureId: number | null;
  municipality: string | null;
}

export function ItemSelector({
  projectId,
  prefectureId,
  municipality,
}: ItemSelectorProps) {
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [masterRes, projectRes] = await Promise.all([
        prefectureId && municipality
          ? fetch(
              `/api/items?prefecture_id=${prefectureId}&municipality=${encodeURIComponent(municipality)}`
            )
          : Promise.resolve(null),
        fetch(`/api/projects/${projectId}/items`),
      ]);

      if (masterRes) {
        const masterData = (await masterRes.json()) as MasterItem[];
        setMasterItems(masterData);
      }

      const projectData = (await projectRes.json()) as ProjectItem[];
      setProjectItems(projectData);
    } catch {
      toast.error("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [projectId, prefectureId, municipality]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const existingSourceIds = new Set(
    projectItems.map((item) => item.sourceItemId).filter(Boolean)
  );

  async function importItems() {
    const newItems = masterItems.filter(
      (item) => !existingSourceIds.has(item.id)
    );

    if (newItems.length === 0) {
      toast.info("すべての項目が登録済みです");
      return;
    }

    setSaving(true);
    try {
      const body = newItems.map((item, idx) => ({
        sourceItemId: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        isSelected: true,
        sortOrder: projectItems.length + idx,
      }));

      const res = await fetch(`/api/projects/${projectId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("インポートに失敗しました");

      toast.success(`${newItems.length}件の項目をインポートしました`);
      fetchData();
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  async function toggleItem(item: ProjectItem) {
    try {
      const res = await fetch(`/api/projects/${projectId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          isSelected: !item.isSelected,
        }),
      });

      if (!res.ok) throw new Error("更新に失敗しました");

      setProjectItems((prev) =>
        prev.map((pi) =>
          pi.id === item.id ? { ...pi, isSelected: !pi.isSelected } : pi
        )
      );
    } catch {
      toast.error("更新に失敗しました");
    }
  }

  if (loading) {
    return (
      <p className="text-center text-muted-foreground py-8">読み込み中...</p>
    );
  }

  const selectedItems = projectItems.filter((item) => item.isSelected);
  const totalSelling = selectedItems.reduce(
    (sum, item) => sum + item.sellingPrice * Number(item.quantity),
    0
  );

  return (
    <div className="space-y-6">
      {/* マスタからインポート */}
      {prefectureId && municipality && (
        <Card>
          <CardHeader>
            <CardTitle>マスタからインポート</CardTitle>
            <CardDescription>
              {municipality}の調査項目マスタから一括インポートします（
              {masterItems.length}件中、未登録{" "}
              {masterItems.filter((m) => !existingSourceIds.has(m.id)).length}
              件）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={importItems} disabled={saving}>
              {saving ? "インポート中..." : "未登録項目を一括インポート"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 選択済み項目 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>調査項目一覧</CardTitle>
              <CardDescription>
                チェックで見積に含める項目を選択
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                選択中: {selectedItems.length}件
              </p>
              <p className="text-lg font-bold">{formatCurrency(totalSelling)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {projectItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {prefectureId && municipality
                ? "「未登録項目を一括インポート」から項目を追加してください"
                : "プロジェクトの都道府県・市区町村を設定してからインポートしてください"}
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">選択</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead className="w-20 text-right">数量</TableHead>
                    <TableHead className="w-16">単位</TableHead>
                    <TableHead className="w-28 text-right">原価</TableHead>
                    <TableHead className="w-28 text-right">売価</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={item.isSelected ? "" : "opacity-50"}
                    >
                      <TableCell>
                        <Checkbox
                          checked={item.isSelected}
                          onCheckedChange={() => toggleItem(item)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.description}</span>
                        {item.notes && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {item.notes}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(item.quantity)}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(item.costPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.sellingPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
