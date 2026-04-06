"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {  
  FiEdit,
  FiAward,
  FiCheckCircle,
  FiStar,
  FiSend,
  FiBriefcase,
  FiGlobe,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { studentService } from "@/services/student.service";
import { StudentProfile, StudentSkill } from "@/types/student";
import SkillBadge from "@/components/ui/SkillBadge";
import TaskCard from "@/components/ui/cards/TaskCard";
import RecommendationCard from "@/components/ui/cards/RecommendationCard";

// Helper to map backend skills to frontend structure
const transformSkills = (skills: StudentSkill[]) => {
  const grouped: Record<string, { name: string; level: number }[]> = {};

  skills.forEach((skill) => {
    const category = skill.category || "Diğer Yetenekler";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ name: skill.skill.name, level: skill.level });
  });

  return Object.keys(grouped).map((category) => ({
    subtitle: category,
    items: grouped[category],
  }));
};

interface StudentStats {
  completedTasks: number;
  totalApplications: number;
  averageRating: number;
  badgesEarned: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats>({
    completedTasks: 0,
    totalApplications: 0,
    averageRating: 0,
    badgesEarned: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          studentService.getProfile(),
          studentService.getMyStats(),
        ]);
        setProfile(profileData);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message || "Profil yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading)
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
  if (!profile)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Profil bulunamadı.</p>
      </div>
    );

  const skillsData = transformSkills(profile.skills);

  const statItems = [
    {
      label: "Tamamlanan Görev",
      value: stats.completedTasks,
      icon: FiCheckCircle,
      color: "text-[#004d40]",
      bg: "bg-[#004d40]/10",
    },
    {
      label: "Ortalama Puan",
      value: stats.averageRating ? stats.averageRating.toFixed(1) : "0.0",
      icon: FiStar,
      color: "text-[#004d40]",
      bg: "bg-[#004d40]/10",
    },
    {
      label: "Kazanılan Rozet",
      value: stats.badgesEarned,
      icon: FiAward,
      color: "text-[#004d40]",
      bg: "bg-[#004d40]/10",
    },
    {
      label: "Başvuru",
      value: stats.totalApplications,
      icon: FiSend,
      color: "text-[#004d40]",
      bg: "bg-[#004d40]/10",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Cover Gradient */}
        <div className="h-36 bg-linear-to-br from-[#004d40] via-[#00695c] to-[#004d40] relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-[#fbb049]/10 rounded-full translate-y-1/2" />

          {/* Edit Button */}
          <Link
            href="/student/settings"
            className="absolute top-4 right-4 flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/25 transition-all"
          >
            <FiEdit className="w-4 h-4" />
            Profili Düzenle
          </Link>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="-mt-16 mb-5 relative z-10">
            <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              <span className="text-4xl font-bold text-[#004d40]">
                {profile.full_name.charAt(0)}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center flex-wrap gap-3">
                  {profile.full_name}
                  {profile.availability_status === 'available' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium border border-green-200 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Müsait
                    </span>
                  )}
                  {profile.availability_status === 'busy' && (
                    <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium border border-red-200 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Meşgul
                    </span>
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-gray-500 mt-1 font-medium">
                  <span>{profile.university || "Üniversite Belirtilmemiş"}</span>
                  {profile.major && <span className="text-gray-300 pointer-events-none">•</span>}
                  {profile.major && <span className="text-gray-700">{profile.major}</span>}
                  {profile.graduation_year && <span className="text-gray-300 pointer-events-none">•</span>}
                  {profile.graduation_year && <span className="text-gray-700">{profile.graduation_year} Mezunu</span>}
                </div>
              </div>

              {/* Contact Details */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  {profile.user.email}
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-1.5">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    {profile.phone}
                  </div>
                )}
              </div>

              {/* Social Icons */}
              <div className="flex gap-2">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#0077b5] hover:text-white transition-all"
                  >
                    <FiLinkedin size={16} />
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#1DA1F2] hover:text-white transition-all"
                  >
                    <FiTwitter size={16} />
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#333] hover:text-white transition-all"
                  >
                    <FiGithub size={16} />
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-teal-600 hover:text-white transition-all"
                  >
                    <FiGlobe size={16} />
                  </a>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-600 text-sm leading-relaxed pt-2 border-t border-gray-100">
                  {profile.bio}
                </p>
              )}

              {/* Interest Categories */}
              {profile.categories_of_interest && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">İlgi Alanları & Odak</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {profile.categories_of_interest.split(',').map((cat, idx) => (
                      <span key={idx} className="bg-[#fbb049]/10 text-[#d98516] px-3 py-1.5 rounded-lg border border-[#fbb049]/30 font-semibold shadow-sm hover:bg-[#fbb049]/20 transition-colors cursor-default">
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Stats Cards (نفس تصميم الداشبورد) */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 lg:min-w-[320px]">
              {statItems.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col justify-center hover:shadow-md transition-shadow group min-h-[90px]"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}
                    >
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40]">
            <FiBriefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Yetenekler</h2>
            <p className="text-xs text-gray-500">Teknik ve temel yetkinlikler</p>
          </div>
        </div>

        <div className="space-y-5">
          {skillsData.length > 0 ? (
            skillsData.map((section, idx) => (
              <div
                key={idx}
                className="bg-gray-50/80 rounded-xl p-5"
              >
                <h4 className="text-sm font-semibold text-[#004d40] mb-3 uppercase tracking-wide">
                  {section.subtitle}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {section.items.map((skillItem, skillIdx) => {
                    const filled = Math.round((skillItem.level / 10) * 5);
                    const color = skillItem.level <= 2 ? "#ef4444" : skillItem.level <= 4 ? "#fb923c" : skillItem.level <= 6 ? "#facc15" : skillItem.level <= 8 ? "#84cc16" : "#22c55e";
                    
                    return (
                      <div
                        key={skillIdx}
                        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm shadow-sm transition-all hover:shadow-md group"
                      >
                        <span className="font-medium text-gray-800">{skillItem.name}</span>
                        {/* Signal bars for level */}
                        <span className="flex items-end gap-[2px] ml-1" title={`Seviye: ${skillItem.level}/10`}>
                          {[1,2,3,4,5].map(i => (
                            <span key={i} style={{ width: 3.5, height: 4 + i * 2, borderRadius: 2, backgroundColor: i <= filled ? color : "#e5e7eb", display: "inline-block", transition: "background-color 0.2s" }} />
                          ))}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium ml-0.5">{skillItem.level}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Henüz yetenek eklenmemiş.
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#004d40]/10 rounded-xl flex items-center justify-center text-[#004d40]">
            <FiStar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tavsiyeler</h2>
            <p className="text-xs text-gray-500">İş birliği yapılan kurumlardan alınan tavsiye mektupları</p>
          </div>
        </div>

        <div className="space-y-4">
          {profile.recommendations && profile.recommendations.length > 0 ? (
            profile.recommendations.map((rec: any, index: number) => (
              <RecommendationCard
                key={rec.id}
                index={index + 1}
                text={rec.content}
                recommenderName={rec.company.company_name}
                recommenderTitle={rec.company.industry || "Şirket Temsilcisi"}
                rating={5}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Henüz tavsiye mektubu bulunmamaktadır.
            </div>
          )}
        </div>
      </div>

      {/* Completed Tasks Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#004d40]/10 rounded-xl flex items-center justify-center text-[#004d40]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Tamamlanan Görevler
            </h2>
            <p className="text-xs text-gray-500">Başarıyla tamamlanan görevler ve projeler</p>
          </div>
        </div>

        <div className="space-y-4">
          {profile.submissions && profile.submissions.length > 0 ? (
            profile.submissions.map((submission: any, index: number) => (
              <TaskCard
                key={submission.id}
                id={submission.task.id}
                index={index + 1}
                title={submission.task.title}
                description={submission.task.description}
                date={new Date(submission.submitted_at).toLocaleDateString(
                  "tr-TR"
                )}
                companyName={submission.task.company.company_name}
                companyId={submission.task.company.id}
                rating={submission.review?.rating || 0}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Henüz tamamlanan görev bulunmamaktadır.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
