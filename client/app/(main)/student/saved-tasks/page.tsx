"use client";

import { useState, useEffect } from "react";
import { FiBookmark } from "react-icons/fi";
import { studentService } from "@/services/student.service";
import TaskCard from "@/components/ui/cards/TaskCard";

export default function SavedTasksPage() {
  const [savedTasks, setSavedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedTasks();
  }, []);

  const fetchSavedTasks = async () => {
    try {
      const data = await studentService.getSavedTasks();
      setSavedTasks(data);
    } catch (error) {
      console.error("Failed to fetch saved tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (taskId: number) => {
    try {
      await studentService.unsaveTask(taskId);
      setSavedTasks(savedTasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Failed to unsave task:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kaydedilen Görevler</h1>
          <p className="text-sm text-gray-500 mt-1">
            Daha sonra başvurmak için kaydettiğiniz görevler
          </p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FiBookmark className="w-4 h-4" />
            <span>{savedTasks.length} görev kaydedildi</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : savedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTasks.map((task, idx) => (
            <TaskCard
              key={task.id}
              id={task.id}
              index={idx + 1}
              title={task.title}
              description={task.description}
              date={new Date(task.created_at).toLocaleDateString("tr-TR")}
              companyName={task.company?.company_name || "Şirket Bilgisi Yok"}
              companyId={task.company?.user_id}
              rating={5}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBookmark className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              Henüz kaydedilmiş bir görev bulunmamaktadır.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
