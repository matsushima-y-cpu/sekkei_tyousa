"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderOpen,
  ClipboardList,
  Settings,
  Users,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/projects", label: "プロジェクト", icon: FolderOpen },
  { href: "/admin/items", label: "調査項目マスタ", icon: ClipboardList },
  { href: "/admin/common-items", label: "共通項目マスタ", icon: FileSpreadsheet },
  { href: "/admin/users", label: "ユーザー管理", icon: Users },
  { href: "/settings", label: "設定", icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/": "ダッシュボード",
  "/projects": "プロジェクト一覧",
  "/projects/new": "新規プロジェクト",
  "/admin/items": "調査項目マスタ",
  "/admin/common-items": "共通項目マスタ",
  "/admin/users": "ユーザー管理",
  "/settings": "設定",
};

export function Header() {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ||
    (pathname.startsWith("/projects/") ? "プロジェクト詳細" : "");

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-4 px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">メニュー</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">ナビゲーション</SheetTitle>
            <div className="flex h-16 items-center px-6 border-b">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <span className="ml-2 font-bold text-lg">設計調査</span>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
