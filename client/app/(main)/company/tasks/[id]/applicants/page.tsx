"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MainSection from "@/components/ui/layouts/MainSection";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { submissionService } from "@/services/submission.service";
import { taskService } from "@/services/task.service";
import { Submission } from "@/types/submission";
import { Task } from "@/types/task";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import {
  FiUser,
  FiCalendar,
  FiExternalLink,
  FiArrowLeft,
  FiX,
  FiCheck,
  FiMail,
  FiBookOpen,
} from "react-icons/fi";

/* ── Review Modal ── */
function ReviewModal({
  submission,
  onClose,
  onUpdate,
}: {
  submission: Submission;
  onClose: () => void;
  onUpdate: (updated: Submission) => void;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);

  const handle = async (status: "approved" | "rejected") => {
    setLoading(status);
    try {
      const updated = await submissionService.updateSubmission(submission.id, status);
      onUpdate(updated);
      showToast(
        status === "approved" ? "Başvuru onaylandı." : "Başvuru reddedildi.",
        status === "approved" ? "success" : "error"
      );
      onClose();
    } catch {
      showToast("İşlem sırasında bir hata oluştu.", "error");
    } finally {
      setLoading(null);
    }
  };

  const statusLabel =
    submission.status === "approved"
      ? "Onaylandı"
      : submission.status === "rejected"
      ? "Reddedildi"
      : "Bekliyor";

  const statusCls =
    submission.status === "approved"
      ? "bg-green-100 text-green-700"
      : submission.status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 z-10">
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shrink-0">
            {submission.student.full_name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {submission.student.full_name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
              {submission.student.university && (
                <span className="flex items-center gap-1">
                  <FiBookOpen className="w-3.5 h-3.5" />
                  {submission.student.university}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FiMail className="w-3.5 h-3.5" />
                {submission.student.user.email}
              </span>
            </div>
          </div>
        </div>

        {/* status */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mevcut Durum:</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls}`}>
              {statusLabel}
            </span>
          </div>
          {typeof submission.ai_match_score === 'number' && (
             <div className="flex items-center gap-2">
               <span className="text-sm text-gray-500">AI Eşleşme Oranı:</span>
               <span className="text-sm font-bold text-[#004d40]">% {submission.ai_match_score}</span>
             </div>
          )}
        </div>

        {/* Financials / Timeline if available */}
        {(submission.proposed_budget || submission.estimated_delivery_days) && (
          <div className="flex gap-6 mb-4">
            {submission.proposed_budget && (
              <div>
                 <p className="text-xs text-gray-400 mb-1">Talep Edilen Bütçe</p>
                 <p className="text-sm font-semibold text-gray-900">${submission.proposed_budget}</p>
              </div>
            )}
            {submission.estimated_delivery_days && (
              <div>
                 <p className="text-xs text-gray-400 mb-1">Teslim Süresi</p>
                 <p className="text-sm font-semibold text-gray-900">{submission.estimated_delivery_days} Gün</p>
              </div>
            )}
          </div>
        )}

        {/* submission content */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Başvuru İçeriği
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {submission.submission_content || "İçerik belirtilmemiş."}
          </p>
        </div>

        {/* date */}
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-6">
          <FiCalendar className="w-3.5 h-3.5" />
          Başvuru Tarihi:{" "}
          {new Date(submission.submitted_at || Date.now()).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* actions */}
        {submission.status === "pending" ? (
          <div className="flex gap-3">
            <button
              onClick={() => handle("approved")}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              <FiCheck className="w-4 h-4" />
              {loading === "approved" ? "İşleniyor..." : "Onayla"}
            </button>
            <button
              onClick={() => handle("rejected")}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              <FiX className="w-4 h-4" />
              {loading === "rejected" ? "İşleniyor..." : "Reddet"}
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">
            Bu başvuru zaten işleme alındı.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Ana Sayfa ── */

export default function TaskApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      try {
        const taskId = Number(params.id);
        const [taskData, submissionsData] = await Promise.all([
          taskService.getTaskById(taskId),
          submissionService.getTaskSubmissions(taskId),
        ]);
        const sortedSubmissions = submissionsData.sort((a: any, b: any) => (b.ai_match_score || 0) - (a.ai_match_score || 0));
        setTask(taskData);
        setSubmissions(sortedSubmissions);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleUpdate = (updated: Submission) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  if (loading)
    return (
      <div className="min-h-screen p-0 mx-auto flex justify-center items-center text-gray-500">
        Yükleniyor...
      </div>
    );

  return (
    <div className="min-h-screen p-0 mx-auto">
      {selected && (
        <ReviewModal
          submission={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}

      <Breadcrumb items={[
        { label: "Panel", href: "/company/dashboard" },
        { label: "Görevlerim", href: "/company/tasks" },
        { label: task?.title || "Görev", href: `/company/tasks` },
        { label: "Başvurular", active: true },
      ]} />

      <MainSection hideHeader>
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Başvuru Listesi
              {submissions.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({submissions.length} başvuru)
                </span>
              )}
            </h2>
            {task && (
              <Link
                href={`/company/tasks/${task.id}/details`}
                className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors mt-0.5"
              >
                <FiExternalLink size={11} />
                Görev Detayları
              </Link>
            )}
          </div>
          <Button variant="outline" icon={FiArrowLeft} onClick={() => router.back()}>
            Geri Dön
          </Button>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiUser size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Henüz başvuru bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {submission.student.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                          {submission.student.full_name}
                        </h3>
                        {typeof submission.ai_match_score === 'number' && (
                          <span className="px-2 py-0.5 bg-[#004d40]/10 text-[#004d40] text-xs font-bold rounded-full border border-[#004d40]/20" title="Yapay Zeka Yetenek Eşleşmesi">
                            % {submission.ai_match_score} AI Uyumlu
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {submission.student.university ||
                          "Üniversite belirtilmemiş"}
                      </p>
                      
                      {/* Metrikler (Bütçe / Zaman) */}
                      <div className="flex items-center gap-4 mt-2">
                        {submission.proposed_budget && (
                           <span className="text-sm font-medium text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                             Bütçe: ${submission.proposed_budget}
                           </span>
                        )}
                        {submission.estimated_delivery_days && (
                           <span className="text-sm font-medium text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                             Süre: {submission.estimated_delivery_days} Gün
                           </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiCalendar size={14} />
                          {new Date(
                            submission.submitted_at || Date.now()
                          ).toLocaleDateString("tr-TR")}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            submission.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : submission.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {submission.status === "approved"
                            ? "Onaylandı"
                            : submission.status === "rejected"
                            ? "Reddedildi"
                            : "Bekliyor"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      variant="primary"
                      className="text-sm w-full md:w-auto"
                      onClick={() => setSelected(submission)}
                    >
                      İncele
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 mb-4">
                  <p className="text-gray-600 text-sm line-clamp-2 italic">
                    {submission.submission_content || "İçerik yok"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </MainSection>
    </div>
  );
}
