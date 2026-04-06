"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { companyService } from "@/services/company.service";
import { CompanyProfile } from "@/types/company";
import { Task } from "@/types/task";
import TaskCard from "@/components/ui/cards/TaskCard";
import { FiMapPin, FiGlobe, FiBriefcase, FiMail } from "react-icons/fi";

export default function CompanyProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (params.id) {
          const companyId = Number(params.id);
          const [profileData, tasksData] = await Promise.all([
            companyService.getCompanyById(companyId),
            companyService.getCompanyTasks(companyId),
          ]);
          setProfile(profileData);
          setTasks(tasksData);
        }
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen mt-12 container mx-auto flex justify-center items-center text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen mt-12 container mx-auto flex justify-center items-center text-gray-500">
        Şirket bulunamadı.
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 container mx-auto pb-12 px-4">
      {/* Company Header */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Logo */}
          <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-3xl font-bold text-gray-300 shrink-0">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.company_name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              profile.company_name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="space-y-4 flex-grow">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.company_name}
              </h1>
              {profile.industry && (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  {profile.industry}
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed max-w-3xl">
              {profile.description || "Şirket açıklaması bulunmuyor."}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-primary" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website_url && (
                <div className="flex items-center gap-2">
                  <FiGlobe className="text-primary" />
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {profile.website_url}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FiMail className="text-primary" />
                <span>{profile.user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <FiBriefcase className="text-2xl text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            Açık İlanlar ({tasks.length})
          </h2>
        </div>

        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                index={task.id}
                title={task.title}
                description={task.description}
                date={
                  task.created_at
                    ? new Date(task.created_at).toLocaleDateString("tr-TR")
                    : "Tarih bulunamadı"
                }
                companyName={profile.company_name}
                companyId={Number(params.id)}
                rating={0} // Default rating since it's not in the Task type yet
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
            Bu şirkete ait açık ilan bulunmamaktadır.
          </div>
        )}
      </div>
    </div>
  );
}
