"use client";

import { cn } from "@/utils/cn";
import { IconType } from "react-icons";
import { FiLoader } from "react-icons/fi";

type FormButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: IconType;
  fullWidth?: boolean;
};

const variantClasses = {
  primary:
    "bg-(--color-primary) text-white hover:opacity-90 focus:ring-(--color-primary)/30 shadow-sm",
  outline:
    "border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300 shadow-sm",
};

const sizeClasses = {
  sm: "h-9 px-4 text-xs rounded-lg",
  md: "h-11 px-6 text-sm rounded-lg",
  lg: "h-12 px-8 text-base rounded-xl",
};

export default function FormButton({
  variant = "primary",
  size = "md",
  isLoading,
  icon: Icon,
  fullWidth,
  children,
  className,
  disabled,
  ...props
}: FormButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-all duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <FiLoader className="mr-2 h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="mr-2 h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
}
