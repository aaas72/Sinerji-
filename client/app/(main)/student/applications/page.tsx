"use client";

import { useState } from "react";
import ApplicationCard, {
  ApplicationStatus,
  RewardType,
} from "@/components/ui/cards/ApplicationCard";
import {
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiInbox,
} from "react-icons/fi";

type Application = {
  id: number;
  title: string;
  tags: string[];
  companyName: string;
  date: string;
  status: ApplicationStatus;
  rewardType?: RewardType;
};

const applications: Application[] = [
  {
    id: 1,
    title:
      "Üniversite Öğrencilerine Yönelik Finans Uygulaması için Logo Tasarımı",
    tags: ["Adobe Illustrator", "Adobe Illustrator", "Adobe Illustrator"],
    companyName: "Fide Finans",
    date: "2 Gün önce",
    status: "İnceleniyor",
    rewardType: "Money",
  },
  {
    id: 2,
    title:
      "Üniversite Öğrencilerine Yönelik Finans Uygulaması için Logo Tasarımı",
    tags: ["Adobe Illustrator", "Adobe Illustrator", "Adobe Illustrator"],
    companyName: "Fide Finans",
    date: "2 Gün önce",
    status: "İnceleniyor",
    rewardType: "Internship",
  },
  {
    id: 3,
    title: "Mobil Uygulama Arayüz Tasarımı",
    tags: ["Figma", "UI/UX", "Prototyping"],
    companyName: "TeknoSoft",
    date: "5 Gün önce",
    status: "Bekliyor",
    rewardType: "Certificate",
  },
  {
    id: 4,
    title: "E-Ticaret Sitesi Geliştirme",
    tags: ["React", "Next.js", "Tailwind"],
    companyName: "Marketim",
    date: "1 Hafta önce",
    status: "Kabul Edildi",
    rewardType: "Recommendation",
  },
  {
    id: 5,
    title: "Kurumsal Kimlik Tasarımı",
    tags: ["Photoshop", "Illustrator", "Branding"],
    companyName: "Global Corp",
    date: "2 Hafta önce",
    status: "Reddedildi",
    rewardType: "Experience",
  },
];

const tabs = [
  { key: "Beklemede", label: "Beklemede", icon: FiClock },
  { key: "Devam Eden", label: "Devam Eden", icon: FiPlay },
  { key: "Tamamlanan", label: "Tamamlanan", icon: FiCheckCircle },
];

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("Beklemede");

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "Beklemede") {
      return app.status === "Bekliyor" || app.status === "İnceleniyor";
    } else if (activeTab === "Devam Eden") {
      return app.status === "Kabul Edildi";
    } else if (activeTab === "Tamamlanan") {
      return app.status === "Reddedildi";
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Başvurularım</h1>
        <p className="text-sm text-gray-500 mt-1">
          Görev başvurularınızı takip edin ve yönetin
        </p>
      </div>

      {/* Tabs & Content Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = applications.filter((app) => {
              if (tab.key === "Beklemede")
                return app.status === "Bekliyor" || app.status === "İnceleniyor";
              if (tab.key === "Devam Eden") return app.status === "Kabul Edildi";
              if (tab.key === "Tamamlanan") return app.status === "Reddedildi";
              return false;
            }).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all relative ${
                  isActive
                    ? "text-[#004d40]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? "bg-[#004d40]/10 text-[#004d40]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#004d40] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  title={app.title}
                  tags={app.tags}
                  companyName={app.companyName}
                  date={app.date}
                  status={app.status}
                  rewardType={app.rewardType}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiInbox className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">
                Bu kategoride başvuru bulunmamaktadır.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Yeni görevlere göz atarak başvuru yapabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
