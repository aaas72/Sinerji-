"use client";

import { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiEdit, FiTrash2, FiUsers, FiEye } from "react-icons/fi";
import { cn } from "@/utils/cn";

type CompanyTaskCardProps = {
  title: string;
  description: string;
  date: string;
  status: "Open" | "In Progress" | "Completed" | "Review";
  applicantCount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewApplicants?: () => void;
  onViewDetails?: () => void;
};

export default function CompanyTaskCard({
  title,
  description,
  date,
  status,
  applicantCount = 0,
  onEdit,
  onDelete,
  onViewApplicants,
  onViewDetails,
}: CompanyTaskCardProps) {
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

  const statusColors = {
    Open: "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-gray-100 text-gray-700",
    Review: "bg-yellow-100 text-yellow-700",
  };

  const statusLabels = {
    Open: "Açık",
    "In Progress": "Devam Ediyor",
    Completed: "Tamamlandı",
    Review: "İnceleniyor",
  };

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 transition-shadow relative">
      <div className="flex justify-between items-start mb-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
                <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full", statusColors[status])}>
                    {statusLabels[status]}
                </span>
                <span className="text-gray-400 text-xs">{date}</span>
           </div>
           <h3 className="font-bold text-md text-primary">{title}</h3>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <FiMoreVertical size={20} className="text-[#004d40]" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 py-1">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => { setIsMenuOpen(false); onEdit?.(); }}
              >
                <FiEdit size={16} className="text-[#004d40]" />
                <span>Düzenle</span>
              </button>
               <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => { setIsMenuOpen(false); onViewApplicants?.(); }}
              >
                <FiUsers size={16} className="text-[#004d40]" />
                <span>Başvuruları Gör</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={() => { setIsMenuOpen(false); onDelete?.(); }}
              >
                <FiTrash2 size={16} className="text-[#004d40]" />
                <span>Sil</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
        {description ? description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : "Açıklama bulunmuyor."}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUsers className="text-[#004d40]" />
            <span>{applicantCount} Başvuru</span>
        </div>
        <button 
          onClick={onViewDetails}
          className="text-[#004d40] text-sm font-medium hover:underline flex items-center gap-1"
        >
          <FiEye className="text-[#004d40]" /> Detaylar
        </button>
      </div>
    </div>
  );
}