"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/utils/cn";
import FormField from "./FormField";

export type FormSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type FormSelectProps = {
  options: FormSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  selectSize?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-9 text-xs px-3",
  md: "h-11 text-sm px-4",
  lg: "h-12 text-base px-4",
};

export default function FormSelect({
  options,
  value,
  onChange,
  onBlur,
  name,
  label,
  placeholder = "Seçiniz...",
  error,
  hint,
  required,
  disabled,
  className,
  wrapperClassName,
  selectSize = "md",
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightIndex >= 0) {
      const items = listRef.current.querySelectorAll("[data-option]");
      items[highlightIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, isOpen]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange?.(val);
      setIsOpen(false);
      onBlur?.();
    },
    [onChange, onBlur]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      const enabledOptions = options.filter((o) => !o.disabled);

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightIndex(
              enabledOptions.findIndex((o) => o.value === value)
            );
          } else if (highlightIndex >= 0 && enabledOptions[highlightIndex]) {
            handleSelect(enabledOptions[highlightIndex].value);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightIndex(0);
          } else {
            setHighlightIndex((prev) =>
              prev < enabledOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setHighlightIndex((prev) =>
              prev > 0 ? prev - 1 : enabledOptions.length - 1
            );
          }
          break;
        case "Escape":
          setIsOpen(false);
          onBlur?.();
          break;
      }
    },
    [disabled, isOpen, highlightIndex, options, value, handleSelect, onBlur]
  );

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <div className="relative" ref={containerRef}>
        {/* Hidden input for form compatibility */}
        <input type="hidden" name={name} value={value || ""} />

        {/* Trigger Button */}
        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={0}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              if (!isOpen) {
                setHighlightIndex(
                  options.findIndex((o) => o.value === value)
                );
              }
            }
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-lg border bg-gray-100/80 text-left",
            "flex items-center justify-between gap-2",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-primary) focus:bg-white",
            "hover:border-gray-300",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
            error
              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
              : isOpen
                ? "border-(--color-primary) ring-2 ring-(--color-primary)/20 bg-white"
                : "border-gray-200",
            sizeClasses[selectSize],
            className
          )}
        >
          <span
            className={cn(
              "truncate",
              selectedOption ? "text-gray-800" : "text-gray-400"
            )}
          >
            {selectedOption?.label || placeholder}
          </span>
          <FiChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        <div
          className={cn(
            "absolute z-50 left-0 w-full mt-1.5 bg-white rounded-xl border shadow-lg overflow-hidden",
            "transition-all duration-200 ease-in-out origin-top",
            isOpen
              ? "opacity-100 visible scale-y-100 translate-y-0 border-gray-200"
              : "opacity-0 invisible scale-y-95 -translate-y-1 border-transparent"
          )}
        >
          <div
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-auto py-1 custom-scrollbar"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightIndex;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-option
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightIndex(index)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm transition-colors duration-100",
                    "flex items-center gap-2",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    isSelected
                      ? "bg-(--color-primary) text-white font-medium"
                      : isHighlighted
                        ? "bg-gray-50 text-(--color-primary)"
                        : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
            {options.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                Seçenek bulunamadı
              </div>
            )}
          </div>
        </div>
      </div>
    </FormField>
  );
}
