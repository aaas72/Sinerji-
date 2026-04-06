"use client";

import { cn } from "@/utils/cn";

type FormFieldProps = {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
};

export default function FormField({
  label,
  required,
  error,
  hint,
  className,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-gray-700 select-none"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-0.5 animate-fadeIn">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
      )}
    </div>
  );
}
