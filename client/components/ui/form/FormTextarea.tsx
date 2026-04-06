"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import FormField from "./FormField";

type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  wrapperClassName?: string;
};

const resizeClasses = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      hint,
      required,
      resize = "vertical",
      className,
      wrapperClassName,
      rows = 4,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <FormField
        label={label}
        required={required}
        error={error}
        hint={hint}
        htmlFor={inputId}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            "w-full rounded-lg border bg-gray-100/80 text-gray-800 placeholder-gray-400 px-4 py-3 text-sm",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-primary) focus:bg-white",
            "hover:border-gray-300",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
            error
              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200",
            resizeClasses[resize],
            className
          )}
          {...props}
        />
      </FormField>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
export default FormTextarea;
