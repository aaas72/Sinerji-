"use client";
import { useState, useEffect } from "react";
import SearchFilter, { SearchFilters } from "@/components/ui/SearchFilter";
import TasksBoard from "@/components/features/tasks/TasksBoard";
import { Task } from "@/components/features/tasks/types";
import { taskService } from "@/services/task.service";
import { studentService } from "@/services/student.service";
import { useAuthStore } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import {
  FiCheckCircle,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";

interface StudentStats {
  completedTasks: number;
  totalApplications: number;
  averageRating: number;
  badgesEarned: number;
}

export default function StudentDashboard() {
  interface User {
    full_name?: string;
    // add other user properties if needed
  }
  const { user, _hasHydrated } = useAuthStore() as { user: User; _hasHydrated: boolean };
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all");
  const [error, setError] = useState("");

  const mapBackendTask = (t: any): Task => ({
    id: t.id.toString(),
    title: t.title,
    tags: t.requiredSkills.map((s: any) => s.skill.name),
    rewardAmount: t.reward_amount || undefined,
    rewardType: t.reward_type || undefined,
    company: { id: t.company_user_id, name: t.company.company_name },
    createdAtLabel: t.created_at
      ? new Date(t.created_at).toLocaleDateString("tr-TR")
      : "Yeni",
    description: t.description || "",
    detailTitle: t.detail_title || "Görev Detayları",
    detailBody: t.detail_body || t.description || "",
    location: t.location || undefined,
    workType: t.work_type || undefined,
    matchPercentage: typeof t.matchPercentage === "number" ? t.matchPercentage : undefined,
  });

  useEffect(() => {
    fetchTasks();
    studentService
      .getMyStats()
      .then(setStats)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // لا تعرض أي شيء حتى يتم التأكد من حالة المصادقة
  if (!_hasHydrated) {
    return null;
  }

  const name = user?.full_name || "Öğrenci";

  const fetchTasks = async (filters?: SearchFilters) => {
    setIsLoading(true);
    try {
      const backendTasks = await taskService.getTasks({
        search: filters?.keyword,
        category: filters?.category,
      });
      setTasks(backendTasks.map(mapBackendTask));
    } catch (err) {
      console.error(err);
      setError("Görevler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendedTasks = async () => {
    setIsRecommendedLoading(true);
    setRecommendedError("");

    try {
      const backendTasks = await taskService.getRecommendedTasks();
      setRecommendedTasks(backendTasks.map(mapBackendTask));
      setViewMode("recommended");
    } catch (err) {
      console.error(err);
      setRecommendedError("AI eşleşen görevler alınamadı. Profil ve mikroservis bağlantısını kontrol edin.");
    } finally {
      setIsRecommendedLoading(false);
    }
  };

  // Duplicate useEffect removed to avoid calling hooks conditionally

  const handleSearch = (filters: SearchFilters) => {
    setViewMode("all");
    fetchTasks(filters);
  };

  const visibleTasks = viewMode === "recommended" ? recommendedTasks : tasks;

  if (isLoading && tasks.length === 0)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#004d40] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#004d40] via-[#00695c] to-[#004d40] rounded-2xl p-8 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#fbb049]/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Hoş Geldin</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>
          <p className="text-white/60 text-sm max-w-lg">
            Yeteneklerine uygun görevleri keşfet, başvur ve kariyerini inşa et.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#004d40]/10 px-3 py-1 text-xs font-semibold text-[#004d40] mb-3">
              <FiZap /> AI Eşleşme Testi
            </div>
            <h2 className="text-lg font-bold text-gray-900">Frontend'den eşleşen görevleri çek</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Bu bölüm doğrudan backend'deki <span className="font-medium text-gray-700">/tasks/recommended</span> endpoint'ini çağırır ve mikroservis skorunu kartlarda gösterir.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={viewMode === "recommended" ? "primary" : "outline"}
              onClick={fetchRecommendedTasks}
              isLoading={isRecommendedLoading}
            >
              Eşleşen Görevleri Getir
            </Button>
            <Button
              type="button"
              variant={viewMode === "all" ? "primary" : "outline"}
              onClick={() => setViewMode("all")}
              icon={FiRefreshCw}
            >
              Tüm Görevler
            </Button>
          </div>
        </div>
        {recommendedError && (
          <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {recommendedError}
          </p>
        )}
      </div>

      {/* Search & Tasks */}
      <SearchFilter onSearch={handleSearch} />
      {visibleTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500">
            {viewMode === "recommended"
              ? "Henüz eşleşen görev bulunamadı."
              : "Henüz görev bulunmamaktadır."}
          </p>
        </div>
      ) : (
        <TasksBoard tasks={visibleTasks} />
      )}
    </div>
  );
}
