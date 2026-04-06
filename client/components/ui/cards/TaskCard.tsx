"use client";

import { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiTrash2, FiEye } from "react-icons/fi";
import StarRating from "../StarRating";
import Link from "next/link";

type TaskCardProps = {
  id?: number;
  index: number;
  title: string;
  description: string | null;
  date: string;
  companyName: string;
  companyId?: number;
  rating: number;
};

export default function TaskCard({
  id,
  index,
  title,
  description,
  date,
  companyName,
  companyId,
  rating,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl flex gap-0 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all relative overflow-hidden">
      {/* Index Icon */}
      <div className="bg-[#004D40] text-white w-10 min-h-full shrink-0 flex items-center justify-center font-bold text-lg rounded-l-xl">
        {index}
      </div>

      {/* Main Content */}
      <div className="grow space-y-3 p-5">
        {/* Top Section: Title, Date and Options */}
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">{date}</span>

            {/* Options Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
              >
                <FiMoreVertical size={18} className="text-[#004d40]" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiEye size={16} className="text-[#004d40]" />
                    <span>Görüntüle</span>
                  </button>
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      console.log("Unsave clicked");
                    }}
                  >
                    <FiTrash2 size={16} className="text-[#004d40]" />
                    <span>Kaydı Kaldır</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section: Description */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
          {description ? description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : "Açıklama bulunmuyor."}
        </p>

        {/* Bottom Section: Details, Company, and Rating */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
          <Link href={`/tasks/${id || index}`}>
            <button className="border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
              Detayları
            </button>
          </Link>
          <div className="flex items-center gap-4">
            {companyId ? (
              <Link
                href={`/companies/${companyId}`}
                className="hover:underline"
              >
                <span className="text-gray-500 font-medium text-sm">
                  {companyName}
                </span>
              </Link>
            ) : (
              <span className="text-gray-500 font-medium text-sm">{companyName}</span>
            )}
            <StarRating rating={rating} />
          </div>
        </div>
      </div>
    </div>
  );
}
