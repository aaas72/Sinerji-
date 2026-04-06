"use client";
import React from "react";
import { cn } from "@/utils/cn";

type TabsProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
  rightAction?: React.ReactNode;
};

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  rightAction,
}: TabsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-gray-200 ",
        className
      )}
    >
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap",
              activeTab === tab
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>
      {rightAction && <div className="ml-auto pl-4">{rightAction}</div>}
    </div>
  );
}
