"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainSection from "@/components/ui/layouts/MainSection";
import MainSectionTitle from "@/components/ui/MainSectionTitle";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  FiCalendar,
  FiAward,
  FiBriefcase,
  FiMapPin,
  FiGlobe,
} from "react-icons/fi";
import { taskService } from "@/services/task.service";
import { Task } from "@/types/task";
import { useAuthStore } from "@/hooks/useAuth";

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (params.id) {
          const data = await taskService.getTaskById(Number(params.id));
          setTask(data);
        }
      } catch (error) {
        console.error("Failed to fetch task details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen mt-12 container mx-auto flex justify-center items-center text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen mt-12 container mx-auto flex justify-center items-center text-gray-500">
        Görev bulunamadı.
      </div>
    );
  }

  // Format date
  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Belirtilmemiş";

  const isCompanyOwner =
    user?.role === "company" && user?.id === task.company_user_id;

  return (
    <div className="min-h-screen mt-12 container mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Task Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

            <div className="relative">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                  task.status === "open"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {task.status === "open" ? "Başvurulara Açık" : "Kapalı"}
              </span>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {task.title}
              </h1>

              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <FiBriefcase className="text-primary" />
                <Link
                  href={`/companies/${task.company_user_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {task.company?.company_name}
                </Link>
                <span className="text-gray-300">•</span>
                <span className="text-sm">
                  Yayınlanma:{" "}
                  {new Date(task.created_at || Date.now()).toLocaleDateString(
                    "tr-TR"
                  )}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <FiAward className="text-orange-500" />
                  <span className="text-sm font-medium">
                    {task.reward_type === "money"
                      ? `${task.reward_value || "Belirtilmemiş"} TL`
                      : task.reward_type === "internship"
                      ? "Staj İmkanı"
                      : "Sertifika"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <FiCalendar className="text-blue-500" />
                  <span className="text-sm font-medium">
                    Son Başvuru: {formattedDeadline}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <MainSection title="Görev Detayları">
            <div 
              className="prose prose-sm sm:prose max-w-none text-gray-600 leading-relaxed break-words [&>p]:break-words [&_*]:whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: task.description || "Açıklama bulunmuyor." }}
            />
          </MainSection>

          {/* Skills */}
          <MainSection title="Gerekli Yetenekler">
            <div className="flex flex-wrap gap-2">
              {task.requiredSkills && task.requiredSkills.length > 0 ? (
                task.requiredSkills.map((skillObj: any, index: number) => (
                  <span
                    key={index}
                    className="bg-white border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  >
                    {skillObj.skill.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 italic">Belirtilmemiş</span>
              )}
            </div>
          </MainSection>
        </div>

        {/* Right Column: Company Info & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">İşlemler</h3>

            {user?.role === "student" ? (
              <Button
                variant="primary"
                className="w-full py-3 text-lg shadow-primary/25 shadow-lg mb-3"
                onClick={() => router.push(`/tasks/${task.id}/apply`)}
              >
                Başvur
              </Button>
            ) : isCompanyOwner ? (
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push(`/company/edit-task/${task.id}`)}
                >
                  Düzenle
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/company/tasks/${task.id}/applicants`)
                  }
                >
                  Başvuruları Gör
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">
                Bu göreve sadece öğrenciler başvurabilir.
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
                  {task.company?.company_name?.charAt(0) || "C"}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {task.company?.company_name}
                  </h4>
                  {task.company?.website_url && (
                    <a
                      href={task.company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <FiGlobe size={12} /> Web Sitesi
                    </a>
                  )}
                </div>
              </div>

              {task.company?.description && (
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                  {task.company.description}
                </p>
              )}

              <Button
                variant="outline"
                className="w-full text-sm py-2"
                onClick={() =>
                  router.push(`/companies/${task.company_user_id}`)
                }
              >
                Şirket Profilini Gör
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
