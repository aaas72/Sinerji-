"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { useMemo } from "react";

// Quill ssr false
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  label,
  error,
  required,
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  return (
    <div className="w-full flex flex-col gap-1.5 focus-within:-group">
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`prose-sm bg-white overflow-hidden rounded-lg border ${error ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"} transition-all`}>
        <ReactQuill
          theme="snow"
          value={value || ""}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          className="border-none"
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: #f9fafb;
          border-radius: 0.5rem 0.5rem 0 0;
        }
        .ql-container.ql-snow {
          border: none !important;
          min-height: 150px;
        }
        .ql-editor {
          min-height: 150px;
          font-family: inherit;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}