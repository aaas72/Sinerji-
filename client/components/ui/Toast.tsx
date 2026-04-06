"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    if (type === "success") {
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Wait for exit animation to finish before calling onClose
        setTimeout(onClose, 300);
      }, 3000); // 3 seconds for success

      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
          type === "success"
            ? "bg-white border-green-100 text-green-700"
            : "bg-white border-red-100 text-red-700"
        } cursor-pointer min-w-[300px]`}
        onClick={type === "error" ? handleClose : undefined}
      >
        <div className="shrink-0">
          {type === "success" ? (
            <FiCheckCircle size={24} className="text-[#004d40]" />
          ) : (
            <FiAlertCircle size={24} className="text-red-500" />
          )}
        </div>
        <div className="grow">
          <p className="font-medium text-sm">{message}</p>
        </div>
        {type === "error" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
