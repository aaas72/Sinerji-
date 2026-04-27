"use client";

import { useEffect, useState } from "react";
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
import { submissionService } from "@/services/submission.service";

type Application = {
  id: number;
  title: string;
  tags: string[];
  companyName: string;
  date: string;
  status: ApplicationStatus;
  rewardType?: RewardType;
};

const tabs = [
  { key: "Beklemede", label: "Beklemede", icon: FiClock },
  { key: "Devam Eden", label: "Devam Eden", icon: FiPlay },
  { key: "Tamamlanan", label: "Tamamlanan", icon: FiCheckCircle },
];

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("Beklemede");
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const subs = await submissionService.getMySubmissions();
        const mapped: Application[] = subs.map((s: any) => ({
          id: s.id,
          title: s.task.title,
          tags: s.task.requiredSkills.map((sk: any) => sk.skill.name),
          companyName: s.task.company.company_name,
          date: new Date(s.submitted_at).toLocaleDateString("tr-TR"),
          status: mapBackendStatus(s.status),
          rewardType: s.task.reward_type as RewardType,
        }));
        setApplications(mapped);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const mapBackendStatus = (status: string): ApplicationStatus => {
    switch (status?.toLowerCase()) {
      case "pending": return "Bekliyor";
      case "reviewing": return "İnceleniyor";
      case "approved":
      case "accepted": return "Kabul Edildi";
      case "rejected": return "Reddedildi";
      default: return "Bekliyor";
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Başvurularım</h1>
        <p className="text-sm text-gray-500 mt-1">
          Görev başvurularınızı takip edin ve yönetin
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
