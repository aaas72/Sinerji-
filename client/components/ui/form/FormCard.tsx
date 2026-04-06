"use client";

import { cn } from "@/utils/cn";

type FormCardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  actions?: React.ReactNode;
};

export default function FormCard({
  title,
  subtitle,
  children,
  className,
  onSubmit,
  actions,
}: FormCardProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        "p-6 md:p-8 lg:p-10",
        "w-full max-w-3xl mx-auto",
        className
      )}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-lg md:text-xl font-bold text-(--color-primary) font-heading">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Form Body */}
      <div className="space-y-6">{children}</div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
          {actions}
        </div>
      )}
    </form>
  );
}
