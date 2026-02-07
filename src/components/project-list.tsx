"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, FileDown } from "lucide-react";

interface Project {
  id: string;
  projectNumber: string | null;
  propertyName: string;
  municipality: string | null;
  lotNumber: string | null;
  customerName: string | null;
  status: string;
  createdAt: string;
}

interface ProjectsResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "下書き",
  investigating: "調査中",
  estimated: "見積済",
  completed: "完了",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  investigating: "default",
  estimated: "secondary",
  completed: "default",
};

export function ProjectList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = (await res.json()) as ProjectsResponse;
      setProjects(data.data);
      setTotal(data.total);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="物件名・顧客名で検索"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="draft">下書き</SelectItem>
            <SelectItem value="investigating">調査中</SelectItem>
            <SelectItem value="estimated">見積済</SelectItem>
            <SelectItem value="completed">完了</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>物件名称</TableHead>
              <TableHead>市区町村</TableHead>
              <TableHead>地番</TableHead>
              <TableHead>顧客名</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-right">出力</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  プロジェクトがありません
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}/edit`)}
                >
                  <TableCell>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {project.propertyName}
                    </Link>
                  </TableCell>
                  <TableCell>{project.municipality || "-"}</TableCell>
                  <TableCell>{project.lotNumber || "-"}</TableCell>
                  <TableCell>{project.customerName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[project.status] || "outline"}>
                      {STATUS_LABELS[project.status] || project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <a href={`/api/projects/${project.id}/export?type=survey`}>
                        <Button variant="ghost" size="sm" title="調査書Excel出力">
                          <FileDown className="h-4 w-4 mr-1" />
                          調査書
                        </Button>
                      </a>
                      <a href={`/api/projects/${project.id}/export?type=estimate`}>
                        <Button variant="ghost" size="sm" title="見積書Excel出力">
                          <FileDown className="h-4 w-4 mr-1" />
                          見積書
                        </Button>
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            全{total}件中 {(page - 1) * limit + 1}-{Math.min(page * limit, total)}件
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
