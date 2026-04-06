"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { cn } from "@/utils/cn";

export type Option = {
  value: string;
  label: string;
};

export type GroupedOption = {
  label: string;
  options: Option[];
};

type CustomSelectProps = {
  options: Option[] | GroupedOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "list" | "grid" | "mega";
  fullWidth?: boolean;
};

function isGroupedOption(
  option: Option | GroupedOption
): option is GroupedOption {
  return (option as GroupedOption).options !== undefined;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  variant = "list",
  fullWidth = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to find the selected label across nested or flat options
  const getSelectedLabel = () => {
    for (const opt of options) {
      if (isGroupedOption(opt)) {
        const found = opt.options.find((o) => o.value === value);
        if (found) return found.label;
      } else {
        if (opt.value === value) return opt.label;
      }
    }
    return null;
  };

  const selectedLabel = getSelectedLabel();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderOption = (option: Option) => (
    <button
      key={option.value}
      type="button"
      onClick={() => {
        onChange(option.value);
        setIsOpen(false);
      }}
      className={cn(
        "text-sm transition-colors w-full",
        variant === "mega" || variant === "grid"
          ? "flex items-center p-2 rounded-md hover:bg-gray-100 text-left"
          : "px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between",
        option.value === value
          ? variant === "mega" || variant === "grid"
            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
            : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]"
          : "text-gray-700"
      )}
    >
      <span className="truncate">{option.label}</span>
      {option.value === value && (
        <FiCheck
          className={cn(
            "w-4 h-4 shrink-0 ml-auto",
            variant === "mega" || variant === "grid"
              ? "text-[var(--color-primary)]"
              : "text-white"
          )}
        />
      )}
    </button>
  );

  return (
    <div
      className={cn(fullWidth ? "static" : "relative", className)}
      ref={containerRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-10 px-4 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] flex items-center justify-between text-sm transition-all duration-200",
          isOpen &&
            "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]"
        )}
      >
        <span
          className={cn(
            "truncate",
            !selectedLabel ? "text-gray-500" : "text-gray-900"
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <FiChevronDown
          className={cn(
            "w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ml-2",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "absolute z-50 mt-1 bg-white border-gray-200 rounded-md shadow-lg overflow-hidden transition-all duration-300 ease-in-out origin-top",
          fullWidth
            ? "left-0 w-full"
            : variant === "mega"
            ? "w-[600px] left-0 md:-left-20 lg:left-0"
            : variant === "grid"
            ? "w-[400px] right-0 md:left-0"
            : "w-full",
          isOpen
            ? "max-h-[80vh] opacity-100 visible translate-y-0 border"
            : "max-h-0 opacity-0 invisible -translate-y-2 border-0"
        )}
      >
        <div
          className={cn(
            variant === "mega"
              ? "grid grid-cols-2 md:grid-cols-4 gap-6 p-4"
              : variant === "grid"
              ? "grid grid-cols-2 gap-2 p-2"
              : "max-h-60 overflow-auto"
          )}
        >
          {variant === "mega"
            ? options.map((groupOrOption, idx) => {
                if (isGroupedOption(groupOrOption)) {
                  return (
                    <div key={idx} className="space-y-2">
                      <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-1 mb-2 text-sm">
                        {groupOrOption.label}
                      </h4>
                      <div className="grid gap-1">
                        {groupOrOption.options.map((opt) => renderOption(opt))}
                      </div>
                    </div>
                  );
                }
                return renderOption(groupOrOption as Option);
              })
            : options.map((option) =>
                // Fallback for flat options in list/grid mode
                renderOption(option as Option)
              )}
        </div>
      </div>
    </div>
  );
}
