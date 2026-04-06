"use client";
import { cn } from "@/utils/cn";
import { IconType } from "react-icons";
import { FiLoader } from "react-icons/fi";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "special" | "default" | "outline";
  isLoading?: boolean;
  icon?: IconType;
};

export default function Button({
  variant = "primary",
  className,
  isLoading,
  icon: Icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<Required<ButtonProps>["variant"], string> = {
    primary:
      "bg-primary text-white hover:opacity-90 focus:ring-[var(--color-primary)]",
    secondary:
      "bg-secondary text-white hover:opacity-90 focus:ring-[var(--color-secondary)]",
    special:
      "bg-special text-black hover:opacity-90 focus:ring-[var(--color-special)]",
    default:
      "bg-section text-primary hover:opacity-90 focus:ring-[var(--color-primary)]",
    outline:
      "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-gray-500",
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
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
