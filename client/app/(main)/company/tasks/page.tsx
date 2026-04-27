"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainSection from "@/components/ui/layouts/MainSection";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CompanyTaskCard from "@/components/ui/cards/CompanyTaskCard";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import { taskService } from "@/services/task.service";
import { Task } from "@/types/task";

export default function MyTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tümü");
  const tabs = ["Tümü", "Açık", "İnceleniyor", "Devam Eden", "Tamamlanan"];

  const filterMap: Record<string, string> = {
    Açık: "open",
    İnceleniyor: "review",
    "Devam Eden": "in_progress",
    Tamamlanan: "closed", // Mapping 'Completed' to 'closed' for now, or add 'completed' status to backend enum
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await taskService.getCompanyTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (taskId: number) => {
    if (confirm("Bu görevi silmek istediğinize emin misiniz?")) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(tasks.filter((t) => t.id !== taskId));
      } catch (error) {
        console.error("Failed to delete task", error);
        alert("Görev silinirken bir hata oluştu.");
      }
    }
  };

  const filteredTasks =
    activeTab === "Tümü"
      ? tasks
      : tasks.filter((t) => t.status === filterMap[activeTab]);

  return (
    <div className="min-h-screen p-0 mx-auto">
      <Breadcrumb items={[
        { label: "Panel", href: "/company/dashboard" },
        { label: "Görevlerim", active: true }
      ]} />
      <MainSection hideHeader>
        {/* Tabs */}
        <div className="flex justify-between items-center " >
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <Link href="/company/tasks/new">
            <Button
              variant="primary"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <FiPlus />
              Yeni Görev
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Yükleniyor...
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <CompanyTaskCard
                key={task.id}
                title={task.title}
                description={task.description || ""}
                date={new Date(task.deadline || task.id).toLocaleDateString()} // Use deadline or fallback
                status={
                  task.status === "open"
                    ? "Open"
                    : task.status === "in_progress"
                    ? "In Progress"
                    : task.status === "closed"
                    ? "Completed"
                    : task.status === "review"
                    ? "Review"
                    : "Open"
                }
                applicantCount={task._count?.submissions || 0}
                onEdit={() => router.push(`/company/tasks/${task.id}/edit`)}
                onDelete={() => handleDelete(task.id)}
                onViewApplicants={() =>
                  router.push(`/company/tasks/${task.id}/applicants`)
                }
                onViewDetails={() =>
                  router.push(`/company/tasks/${task.id}/details`)
                }
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              Bu kategoride görev bulunmamaktadır.
            </div>
          )}
        </div>
      </MainSection>
    </div>
  );
}
