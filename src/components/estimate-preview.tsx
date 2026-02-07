"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface ProjectItem {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  isSelected: boolean;
  sortOrder: number;
}

interface EstimatePreviewProps {
  projectId: string;
}

export function EstimatePreview({ projectId }: EstimatePreviewProps) {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/items`)
      .then((res) => res.json())
      .then((data: ProjectItem[]) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <p className="text-center text-muted-foreground py-8">読み込み中...</p>
    );
  }

  const selectedItems = items.filter((item) => item.isSelected);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.sellingPrice * Number(item.quantity),
    0
  );
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  const totalCost = selectedItems.reduce(
    (sum, item) => sum + item.costPrice * Number(item.quantity),
    0
  );
  const marginRate =
    subtotal > 0 ? ((subtotal - totalCost) / subtotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 集計サマリ */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">小計（税抜）</p>
            <p className="text-2xl font-bold">{formatCurrency(subtotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">消費税（10%）</p>
            <p className="text-2xl font-bold">{formatCurrency(tax)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">合計（税込）</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(total)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">粗利率</p>
            <p className="text-2xl font-bold">{marginRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* 明細テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>見積明細</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              選択された調査項目がありません。「調査項目」タブで項目を選択してください。
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No.</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead className="w-20 text-right">数量</TableHead>
                    <TableHead className="w-16">単位</TableHead>
                    <TableHead className="w-28 text-right">単価</TableHead>
                    <TableHead className="w-28 text-right">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">
                        {Number(item.quantity)}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.sellingPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(
                          item.sellingPrice * Number(item.quantity)
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-medium">
                      小計（税抜）
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(subtotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-medium">
                      消費税（10%）
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(tax)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-medium">
                      合計（税込）
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary text-lg">
                      {formatCurrency(total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
