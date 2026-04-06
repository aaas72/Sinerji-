import React from "react";
import { cn } from "@/utils/cn";

type SkillBadgeProps = {
  label: string;
  className?: string;
};

export default function SkillBadge({ label, className }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "bg-gray-100 text-secondary px-3 py-1 rounded-full text-sm",
        className
      )}
    >
      {label}
    </span>
  );
}
