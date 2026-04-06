"use client";

import TaskCard from "@/components/ui/cards/TaskCard";
import { FiBookmark } from "react-icons/fi";

const savedTasks = [
  {
    id: 1,
    title: "E-Ticaret Sitesi UI/UX Tasarımı",
    description:
      "Kullanıcı dostu ve modern bir e-ticaret sitesi arayüzü tasarlanması gerekmektedir. Figma üzerinde çalışılacaktır.",
    date: "3 Gün önce",
    companyName: "TechMarket",
    companyId: 1,
    rating: 5,
  },
  {
    id: 2,
    title: "Python ile Veri Analizi",
    description:
      "Satış verilerinin analizi ve görselleştirilmesi için Python scriptleri yazılacaktır. Pandas ve Matplotlib kullanılacaktır.",
    date: "1 Hafta önce",
    companyName: "DataCorp",
    companyId: 2,
    rating: 4,
  },
  {
    id: 3,
    title: "Sosyal Medya İçerik Üretimi",
    description:
      "Markamızın Instagram ve LinkedIn hesapları için aylık içerik planı ve görsel tasarımları hazırlanacaktır.",
    date: "2 Hafta önce",
    companyName: "CreativeAgency",
    companyId: 3,
    rating: 4.5,
  },
];

export default function SavedTasksPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kaydedilen Görevler</h1>
          <p className="text-sm text-gray-500 mt-1">
            Daha sonra başvurmak için kaydettiğiniz görevler
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiBookmark className="w-4 h-4" />
          <span>{savedTasks.length} görev kaydedildi</span>
        </div>
      </div>

      {/* Tasks Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {savedTasks.length > 0 ? (
          <div className="p-6 space-y-4">
            {savedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                index={index + 1}
                title={task.title}
                description={task.description}
                date={task.date}
                companyName={task.companyName}
                companyId={task.companyId}
                rating={task.rating}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBookmark className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              Henüz kaydedilmiş bir görev bulunmamaktadır.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Görevleri keşfederken beğendiklerinizi kaydedin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
