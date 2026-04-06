import { cn } from "@/utils/cn";

type MainSectionTitleProps = {
  title: string;
  variant?: "default" | "primary" | "secondary";
  className?: string;
};

export default function MainSectionTitle({
  title,
  variant = "default",
  className,
}: MainSectionTitleProps) {
  const variantClasses = {
    default: "text-primary",
    primary: "text-primary",
    secondary: "text-secondary",
  };

  return (
    <h2
      className={cn(
        "text-lg font-medium mb-2",
        variantClasses[variant],
        className
      )}
    >
      {title}
    </h2>
  );
}
