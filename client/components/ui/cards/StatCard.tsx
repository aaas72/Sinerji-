import React from "react";
import { cn } from "@/utils/cn";

type StatCardProps = {
  value: string | number;
  label: string;
  className?: string;
};

export default function StatCard({ value, label, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "text-center p-4 rounded-md border border-primary flex-1 md:flex-none min-w-[100px]",
        className
      )}
    >
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}
