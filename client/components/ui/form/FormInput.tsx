"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { IconType } from "react-icons";
import FormField from "./FormField";

type FormInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: IconType;
  iconPosition?: "left" | "right";
  inputSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  wrapperClassName?: string;
};

const sizeClasses = {
  sm: "h-9 text-xs px-3",
  md: "h-11 text-sm px-4",
  lg: "h-12 text-base px-4",
};

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      hint,
      required,
      icon: Icon,
      iconPosition = "left",
      inputSize = "md",
      fullWidth = true,
      className,
      wrapperClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    const hasIcon = !!Icon;

    return (
      <FormField
        label={label}
        required={required}
        error={error}
        hint={hint}
        htmlFor={inputId}
        className={wrapperClassName}
      >
        <div className="relative">
          {hasIcon && iconPosition === "left" && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border bg-gray-100/80 text-gray-800 placeholder-gray-400",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-primary) focus:bg-white",
              "hover:border-gray-300",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
              error
                ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                : "border-gray-200",
              sizeClasses[inputSize],
              hasIcon && iconPosition === "left" && "pl-10",
              hasIcon && iconPosition === "right" && "pr-10",
              !fullWidth && "w-auto",
              className
            )}
            {...props}
          />
          {hasIcon && iconPosition === "right" && (
            <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
        </div>
      </FormField>
    );
  }
);

FormInput.displayName = "FormInput";
export default FormInput;
