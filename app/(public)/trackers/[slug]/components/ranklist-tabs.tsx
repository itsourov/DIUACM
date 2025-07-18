"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RankListTabsProps {
  keywords: string[];
  currentKeyword: string;
  trackerSlug: string;
}

export function RankListTabs({
  keywords,
  currentKeyword,
  trackerSlug,
}: RankListTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => {
        const isActive = keyword === currentKeyword;
        const href = `/trackers/${trackerSlug}${
          keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""
        }`;

        return (
          <Link key={keyword} href={href}>
            <Button
              variant={isActive ? "default" : "secondary"}
              size="sm"
              className={
                isActive
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              }
            >
              {keyword}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
