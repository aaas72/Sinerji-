"use client";
import { cn } from "@/utils/cn";

type MainSectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "muted" | "transparent";
  bordered?: boolean;
  rounded?: "none" | "sm" | "md" | "lg";
  padding?: "none" | "sm" | "md" | "lg";
  headerExtra?: React.ReactNode; // عناصر جانبية في الهيدر مثل أزرار أو روابط
  hideHeader?: boolean; // إخفاء الهيدر بالكامل
};

export default function MainSection({
  title = "Ana Bölüm",
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  variant = "default",
  bordered = true,
  rounded = "md",
  padding = "md",
  headerExtra,
  hideHeader = false,
}: MainSectionProps) {
  const variantClasses = {
    default: "bg-section",
    muted: "bg-[var(--color-body-bg)]",
    transparent: "bg-transparent",
  }[variant];

  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
  }[rounded];

  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }[padding];

  const containerClasses = cn(
    variantClasses,
    roundedClasses,
    paddingClasses,
    bordered ? "border border-gray-300 " : "",
    className
  );

  return (
    <div className={containerClasses}>
      {!hideHeader && (
        <div
          className={cn(
            "flex items-center justify-between mb-6",
            headerClassName
          )}
        >
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-primary">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-secondary mt-1">{description}</p>
            )}
          </div>
          {headerExtra}
        </div>
      )}
      <div className={cn("", contentClassName)}>{children}</div>
    </div>
  );
}
