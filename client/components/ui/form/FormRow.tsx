"use client";

import { cn } from "@/utils/cn";

type FormRowProps = {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
};

const colClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export default function FormRow({
  children,
  cols = 2,
  className,
}: FormRowProps) {
  return (
    <div className={cn("grid gap-5", colClasses[cols], className)}>
      {children}
    </div>
  );
}
