"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Button from "@/components/ui/Button";
import SkillBadge from "@/components/ui/SkillBadge";
import {
  FiBookmark,
  FiLink,
  FiStar,
  FiBriefcase,
  FiMapPin,
  FiShare2,
  FiAward,
} from "react-icons/fi";
import { Task, getRewardIcon } from "./types";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useState, useEffect } from "react";

interface TaskDetailProps {
  task: Task;
}

export default function TaskDetail({ task }: TaskDetailProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const hasMatchPercentage = typeof task.matchPercentage === "number";

  useEffect(() => {
    const saved = localStorage.getItem(`saved_task_${task.id}`);
    if (saved) setIsSaved(true);
  }, [task.id]);

  const handleSave = () => {
    if (isSaved) {
      localStorage.removeItem(`saved_task_${task.id}`);
      setIsSaved(false);
      showToast("Görev kaydedilenlerden çıkarıldı.", "success");
    } else {
      localStorage.setItem(`saved_task_${task.id}`, "true");
      setIsSaved(true);
      showToast("Görev başarıyla kaydedildi!", "success");
    }
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url).then(() => {
      showToast("Bağlantı kopyalandı!", "success");
    }).catch(() => {
      showToast("Bağlantı kopyalanamadı.", "error");
    });
  };

  // Call getRewardIcon instead of using it as a component to avoid render issues
  const rewardIconNode = getRewardIcon(task.rewardType)({ className: "w-5 h-5" });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Fixed Header Section */}
      <div className="p-6 pb-4 flex-none border-b border-gray-200 z-10 bg-white">
        {/* Logo & Title Row */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
              {/* Placeholder Logo */}
              <span className="text-xs font-bold text-gray-400">LOGO</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2 wrap-break-word">
                {task.title}
              </h2>
              <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
                <Link
                  href={task.company.id ? `/companies/${task.company.id}` : "#"}
                  className="hover:underline font-medium text-gray-800"
                >
                  {task.company.name}
                </Link>
                <span className="text-gray-300">•</span>
                {hasMatchPercentage && (
                  <>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      AI uyum %{task.matchPercentage}
                    </span>
                    <span className="text-gray-300">•</span>
                  </>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-gray-700 font-semibold">4.2</span>
                  <FiStar className="w-3 h-3 fill-current text-[#fbb049]" />
                </div>
                <span className="text-gray-300">•</span>
                <span>{task.location || "Türkiye"}</span>
              </div>
            </div>
          </div>
          <Button
            className="bg-[#004d40] hover:bg-[#003d33] text-white px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors shrink-0 sm:mt-0 mt-2"
            variant="primary"
            onClick={() => router.push(`/student/tasks/${task.id}/apply`)}
          >
            Görevi Al
            <FiShare2 className="ml-2 w-4 h-4 inline" />
          </Button>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-end mt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${
                  isSaved
                    ? "border-[#004d40] text-[#004d40] bg-[#004d40]/5"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-[#004d40] hover:text-[#004d40]"
                }`}
                title={isSaved ? "Kaydedildi" : "Kaydet"}
              >
                <FiBookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleCopyLink}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-[#004d40] hover:text-[#004d40] transition-colors"
                title="Linki Kopyala"
              >
                <FiLink className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="p-6 space-y-6">
          {/* Quick Info Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reward Info */}
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-[#004d40] shadow-sm">
                <FiAward className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Ödül Türü</span>
                {(() => {
                  const displayText =
                    task.rewardType === "Nakit" && task.rewardAmount
                      ? task.rewardAmount
                      : task.rewardType;
                  if (!displayText) return <span className="text-sm font-semibold text-gray-800">Belirtilmemiş</span>;
                  return (
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-gray-800 capitalize">{displayText}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
               <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-[#004d40] shadow-sm">
                <FiMapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Konum / Çalışma Şekli</span>
                <span className="text-sm font-semibold text-gray-800">
                  {task.location || "Türkiye"} 
                  {task.workType && (
                    <>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-[#004d40] font-bold capitalize">
                        {task.workType === 'remote' ? 'Uzaktan' : task.workType === 'hybrid' ? 'Hibrit' : task.workType === 'onsite' ? 'Ofiste' : task.workType}
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Required Skills Section */}
          {task.tags && task.tags.length > 0 && (
            <section className="bg-blue-50/30 p-5 rounded-xl border border-blue-100/50">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiBriefcase className="text-blue-500" /> Aranan Temel Yetenekler
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag: string, i: number) => (
                  <SkillBadge key={i} label={tag} />
                ))}
              </div>
            </section>
          )}

          {/* Full Job Description Section */}
          <section className="pt-2">
             <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              {task.detailTitle || "Görev Açıklaması"}
            </h3>

            <div className="text-gray-700 leading-relaxed text-[15px] space-y-4 wrap-break-word">
              {/* Render Detail Body with HTML if it's rich text */}
              {task.detailBody ? (
                <div
                  className="prose prose-sm prose-slate max-w-full wrap-break-word whitespace-pre-wrap **:whitespace-pre-wrap prose-headings:text-gray-800 prose-a:text-[#004d40] hover:prose-a:text-[#003d33] prose-strong:text-gray-900"
                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  dangerouslySetInnerHTML={{ __html: task.detailBody }}
                />
              ) : (
                <div className="prose prose-sm prose-slate max-w-full wrap-break-word overflow-x-hidden">
                  <p>
                    <strong>Genel Tanım:</strong>
                  </p>
                  <p>Bu görev için detaylı bir açıklama girilmemiştir.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
