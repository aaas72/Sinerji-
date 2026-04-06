"use client";

import { cn } from "@/utils/cn";

type FormSectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export default function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-5", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
