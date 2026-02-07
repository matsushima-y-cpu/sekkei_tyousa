"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProjectTabsProps {
  projectId: string;
}

const tabs = [
  { label: "基本情報", path: "" },
  { label: "役所調査書", path: "/survey" },
  { label: "調査項目", path: "/items" },
  { label: "見積プレビュー", path: "/estimate" },
];

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  return (
    <div className="border-b">
      <nav className="flex gap-4">
        {tabs.map((tab) => {
          const href = `${basePath}${tab.path}`;
          const isActive =
            tab.path === ""
              ? pathname === basePath
              : pathname.startsWith(href);

          return (
            <Link
              key={tab.path}
              href={href}
              className={cn(
                "px-1 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
