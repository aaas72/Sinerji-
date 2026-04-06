"use client";
import { useState, useEffect } from "react";
import SearchFilter, { SearchFilters } from "@/components/ui/SearchFilter";
import TasksBoard from "@/components/features/tasks/TasksBoard";
import { Task } from "@/components/features/tasks/types";
import { taskService } from "@/services/task.service";
import { studentService } from "@/services/student.service";
import { useAuthStore } from "@/hooks/useAuth";
import {
  FiCheckCircle,
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
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

      const formattedTasks: Task[] = backendTasks.map((t) => ({
        id: t.id.toString(),
        title: t.title,
        tags: t.requiredSkills.map((s) => s.skill.name),
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
      }));

      setTasks(formattedTasks);
    } catch (err) {
      console.error(err);
      setError("Görevler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  // Duplicate useEffect removed to avoid calling hooks conditionally

  const handleSearch = (filters: SearchFilters) => {
    fetchTasks(filters);
  };

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
          <p className="text-white/70 text-sm font-medium mb-1">Hoş Geldin 👋</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>
          <p className="text-white/60 text-sm max-w-lg">
            Yeteneklerine uygun görevleri keşfet, başvur ve kariyerini inşa et.
          </p>
        </div>
      </div>

      {/* Search & Tasks */}
      <SearchFilter onSearch={handleSearch} />
      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500">Henüz görev bulunmamaktadır.</p>
        </div>
      ) : (
        <TasksBoard tasks={tasks} />
      )}
    </div>
  );
}
