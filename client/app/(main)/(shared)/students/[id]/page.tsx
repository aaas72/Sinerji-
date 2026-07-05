"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";
import {  
  FiEdit,
  FiAward,
  FiCheckCircle,
  FiStar,
  FiBriefcase,
  FiGlobe,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiCalendar,
  FiLayers,
  FiUser,
  FiAtSign,
  FiMapPin,
  FiMessageSquare,
} from "react-icons/fi";
import { studentService } from "@/services/student.service";
import { StudentProfile, StudentSkill } from "@/types/student";
import SectionCard from "@/components/ui/cards/SectionCard";
import MainSection from '@/components/layout/MainSection';
import Breadcrumb from "@/components/ui/Breadcrumb";
import PrimaryButton from "@/components/ui/PrimaryButton";
import StatusBadge from "@/components/ui/badges/StatusBadge";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const studentId = Number(params.id);
  const isOwner = user?.role === 'student' && user?.id === studentId;

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
    if (!studentId) return;
    
    const fetchData = async () => {
      try {
        const profileData = await studentService.getStudentById(studentId);
        setProfile(profileData);
        
        if (isOwner) {
          const statsData = await studentService.getMyStats();
          setStats(statsData);
        }
      } catch (err: any) {
        setError(err.message || "Profil yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [studentId, isOwner]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#004d40] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Profil Hazırlanıyor...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <FiAtSign size={32} />
        </div>
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-[#004d40] underline">Tekrar Dene</button>
      </div>
    );

  if (!profile) return null;

  const skillsData = transformSkills(profile.skills);

  const completedTasksCount = profile.submissions?.length || 0;
  const ratings = profile.submissions?.map((s: any) => s.review?.rating).filter((r: any) => typeof r === 'number') || [];
  const averageRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : "0.0";

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">


      <MainSection hideHeader variant="transparent" bordered={false} padding="none">
        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#004d40] to-[#00796b] flex items-center justify-center shadow-lg select-none shrink-0 border-4 border-white overflow-hidden">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover animate-fadeIn"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white font-extrabold text-3xl tracking-wide leading-none">
                  {profile.full_name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("")}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`text-[13px] font-bold uppercase tracking-wider ${
                  profile.availability_status === "available" 
                    ? "text-[#004d40]" 
                    : "text-red-700"
                }`}>
                  {profile.availability_status === "available" ? "Müsait" : "Meşgul"}
                </span>
              </div>
              <h1 className="text-[28px] md:text-[36px] font-bold leading-tight text-[#00342b] font-sans break-words tracking-tight">
                {profile.full_name}
              </h1>
              <p className="text-sm md:text-base text-[#565e74] font-medium flex items-center gap-2">
                {profile.major || "Bölüm Belirtilmemiş"} 
                {profile.university && <span className="opacity-50">•</span>}
                {profile.university && profile.university}
              </p>
              
              {completedTasksCount > 0 && (
                <div className="flex flex-wrap items-center gap-5 pt-1">
                  <div className="flex items-center gap-1.5 text-[#e28743]" title="Ortalama Puan">
                    <FiStar className="fill-current w-5 h-5" />
                    <span className="text-base font-bold">{averageRating}</span>
                    <span className="text-xs font-semibold opacity-70 mt-0.5">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#004d40]" title="Tamamlanan Görevler">
                    <span className="text-base font-bold">{completedTasksCount} Görev Tamamlandı</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 mt-4 md:mt-0">
            {isOwner ? (
              <PrimaryButton 
                variant="outline" 
                className="!rounded-full border-[#dfded6]" 
                onClick={() => router.push('/student/profile/edit')}
              >
                <FiEdit className="mr-2" /> Profili Düzenle
              </PrimaryButton>
            ) : null}
          </div>
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {/* Hakkımda (About Me) */}
            {profile.bio && (
              <SectionCard title="Hakkımda" icon={FiUser}>
                <p className="text-[#565e74] text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </SectionCard>
            )}

            {/* Education */}
            <SectionCard title="Eğitim Bilgileri" icon={FiBookOpen}>
              <div className="relative pl-6 ml-2 mt-4">
                {/* Timeline Line */}
                <div className="absolute left-[20px] top-[24px] bottom-[24px] w-[1px] bg-gradient-to-b from-[#e28743] to-transparent opacity-20 z-0" />

                {/* Education Node */}
                <div className="relative group">
                  <div className="absolute left-[-32px] top-1 w-6 h-6 rounded-full bg-[#ffffff] border-2 border-[#e28743] flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-[#e28743]"></div>
                  </div>
                  
                  <div className="bg-transparent border border-[#f1f0ea] rounded-xl p-5 ml-1 transition-all hover:border-[#e28743]/30 hover:shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-[#00342b]">{profile.university || "Üniversite Belirtilmedi"}</h3>
                      <span className="text-xs text-[#565e74] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 mt-1 sm:mt-0 bg-gray-50 px-2 py-1 rounded-md">
                        <FiCalendar className="w-3.5 h-3.5" /> {profile.graduation_year ? `${profile.graduation_year} Mezunu` : "Aktif"}
                      </span>
                    </div>
                    
                    <h4 className="text-[#565e74] font-semibold text-sm flex items-center gap-1.5">
                      <FiBookOpen className="w-4 h-4" /> {profile.major || "Bölüm Belirtilmedi"}
                    </h4>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Completed Tasks (Submissions) */}
            {profile.submissions && profile.submissions.length > 0 && (
              <SectionCard title="Tamamlanan Görevler" icon={FiCheckCircle}>
                <div className="relative pl-6 ml-2 mt-4">
                  {/* Timeline Line */}
                  <div className="absolute left-[20px] top-[24px] bottom-[24px] w-[1px] bg-gradient-to-b from-[#004d40] to-transparent opacity-20 z-0" />

                  {profile.submissions.map((submission: any, index: number) => (
                    <div key={submission.id} className="relative mb-6 group">
                      <div className="absolute left-[-32px] top-1 w-6 h-6 rounded-full bg-[#ffffff] border-2 border-[#00342b] flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-[#00342b]"></div>
                      </div>
                      
                      <div className="bg-transparent border border-[#f1f0ea] rounded-xl p-5 ml-1 transition-all hover:border-[#004d40]/30 hover:shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-[#00342b]">{submission.task.title}</h3>
                          <span className="text-xs text-[#565e74] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 mt-1 sm:mt-0 bg-gray-50 px-2 py-1 rounded-md">
                            <FiCalendar className="w-3.5 h-3.5" /> {new Date(submission.submitted_at).getFullYear()}
                          </span>
                        </div>
                        
                        <h4 className="text-[#004d40] font-semibold text-sm flex items-center gap-1.5">
                          <FiAward className="w-4 h-4" /> {submission.task.company.company_name}
                        </h4>

                        {submission.review && (
                          <div className="border-t border-[#f1f0ea] pt-4 mt-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#565e74]">Değerlendirme</span>
                              <div className="flex gap-1 text-[#e28743]">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <FiStar key={i} className={`w-4 h-4 ${i < submission.review.rating ? 'fill-current' : 'opacity-20'}`} />
                                ))}
                              </div>
                            </div>
                            {submission.review.feedback && (
                              <p className="text-[#565e74] text-[13px] italic leading-relaxed">
                                "{submission.review.feedback}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Guaranteed Certificates & Recommendations */}
            {profile.submissions && profile.submissions.some((sub: any) => sub.guarantee_token) && (
              <SectionCard title="Doğrulanmış Başarılar" icon={FiCheckCircle}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.submissions.filter((sub: any) => sub.guarantee_token).map((sub: any) => (
                    <div key={sub.id} className="p-4 border border-[#004d40]/20 rounded-xl bg-gradient-to-br from-[#004d40]/5 to-transparent flex flex-col justify-between hover:border-[#004d40]/40 transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-[#00342b] text-sm">{sub.task.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-1 bg-[#004d40] text-white rounded-md uppercase">
                            {sub.task.reward_type === 'Internship' || sub.task.reward_type?.toLowerCase() === 'internship' ? 'Staj' : sub.task.reward_type === 'Certificate' || sub.task.reward_type?.toLowerCase() === 'certificate' ? 'Sertifika' : 'Tavsiye'}
                          </span>
                        </div>
                        <p className="text-xs text-[#565e74] mb-4">
                          <span className="font-semibold text-[#004d40]">{sub.task.company.company_name}</span> tarafından onaylanmıştır.
                        </p>
                      </div>
                      <div className="pt-3 border-t border-[#004d40]/10 flex justify-between items-center">
                         <span className="text-[10px] font-mono text-[#565e74] bg-white px-2 py-1 rounded border border-gray-100" title={sub.guarantee_token}>Ref: {sub.guarantee_token.split('-')[0]}</span>
                         <a href={`/company/verify-guarantee`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#004d40] hover:underline flex items-center gap-1">
                           Doğrula <FiGlobe size={12} />
                         </a>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Badges & Achievements */}
            <SectionCard title="Rozetler ve Başarılar" icon={FiAward}>
              {profile.submissions && profile.submissions.some((sub: any) => sub.review?.awardedBadges?.length > 0) ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from(new Map(
                    profile.submissions
                      .flatMap((sub: any) => sub.review?.awardedBadges?.map((ab: any) => ab.badge) || [])
                      .filter(Boolean)
                      .map((badge: any) => [badge.id, badge])
                  ).values()).map((badge: any) => (
                    <div key={badge.id} className="flex flex-col items-center p-4 bg-transparent border border-[#f1f0ea] rounded-2xl hover:border-[#e28743]/40 hover:shadow-sm transition-all text-center">
                      <div className="w-12 h-12 rounded-full bg-[#e28743]/10 text-[#e28743] flex items-center justify-center mb-3">
                        {badge.icon_url ? (
                           <img src={badge.icon_url} alt={badge.name} className="w-6 h-6 object-contain" />
                        ) : (
                           <FiAward className="w-6 h-6" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#00342b] leading-tight">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-[#565e74]">
                  <p className="text-sm font-medium">Henüz bir rozet veya başarı kazanılmadı.</p>
                </div>
              )}
            </SectionCard>

            {/* Recommendations Block */}
            <SectionCard title="Tavsiyeler" icon={FiStar}>
              {profile.recommendations && profile.recommendations.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {profile.recommendations.map((rec: any) => (
                    <div key={rec.id} className="bg-transparent border border-[#f1f0ea] rounded-xl p-6">
                      <p className="text-[#565e74] text-[15px] italic mb-6 leading-relaxed">"{rec.content}"</p>
                      <div className="flex justify-between items-center border-t border-[#f1f0ea] pt-4">
                        <div>
                          <h4 className="font-bold text-[#00342b] text-sm">{rec.company.company_name}</h4>
                          <span className="text-[11px] font-semibold text-[#565e74] uppercase tracking-wider">{rec.company.industry || "Referans"}</span>
                        </div>
                        <div className="flex gap-1 text-[#e28743]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} className={`w-3.5 h-3.5 ${i < (rec.rating || 5) ? 'fill-current' : 'opacity-20'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-[#565e74]">
                  <p className="text-sm font-medium">Henüz bir tavsiye bulunmuyor.</p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-8 min-w-0">
            {/* Yetenekler */}
            <SectionCard title="Yetenekler" icon={FiLayers}>
              <div className="flex flex-col gap-6">
                {skillsData.length > 0 ? (
                  skillsData.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#565e74] border-b border-[#f1f0ea] pb-2">
                        {section.subtitle}
                      </h4>
                      <div className="flex flex-col gap-4">
                        {section.items.map((skillItem, skillIdx) => (
                          <div key={skillIdx} className="w-full">
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                              <span className="text-[#00342b]">{skillItem.name}</span>
                              <span className="text-[#004d40]">{skillItem.level}/10</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-[#004d40] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${(skillItem.level / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 font-medium">Henüz yetenek eklenmemiş.</p>
                )}
              </div>
            </SectionCard>

            {/* Contact & Social Links */}
            <SectionCard title="İletişim & Sosyal Medya" icon={FiMail}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[#f1f0ea] bg-transparent">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#565e74] shrink-0">
                    <FiMail size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-extrabold text-[#565e74] uppercase tracking-wider">E-posta</p>
                    <p className="text-sm font-bold text-[#00342b] truncate">{profile.user.email}</p>
                  </div>
                </div>

                {profile.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[#f1f0ea] bg-transparent">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#565e74] shrink-0">
                      <FiPhone size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-extrabold text-[#565e74] uppercase tracking-wider">Telefon</p>
                      <p className="text-sm font-bold text-[#00342b] truncate">{profile.phone}</p>
                    </div>
                  </div>
                )}

                {/* Social Links Row */}
                <div className="flex items-center gap-3 pt-4 px-2">
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#f1f0ea] flex items-center justify-center text-[#565e74] hover:text-[#333] hover:border-[#333] transition-colors" title="GitHub">
                      <FiGithub size={18} />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#f1f0ea] flex items-center justify-center text-[#565e74] hover:text-[#0077b5] hover:border-[#0077b5] transition-colors" title="LinkedIn">
                      <FiLinkedin size={18} />
                    </a>
                  )}
                  {profile.twitter_url && (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#f1f0ea] flex items-center justify-center text-[#565e74] hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-colors" title="Twitter">
                      <FiTwitter size={18} />
                    </a>
                  )}
                  {profile.website_url && (
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#f1f0ea] flex items-center justify-center text-[#565e74] hover:text-[#004d40] hover:border-[#004d40] transition-colors" title="Website">
                      <FiGlobe size={18} />
                    </a>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Interests Card */}
            {profile.categories_of_interest && profile.categories_of_interest.trim() !== "" && (
              <SectionCard title="İlgi Alanları" icon={FiMapPin}>
                <div className="flex flex-wrap gap-2">
                  {profile.categories_of_interest.split(',').map((cat: string) => cat.trim()).filter((cat: string) => cat !== "").map((cat: string, idx: number) => (
                    <span key={idx} className="bg-transparent text-[#565e74] px-4 py-2 rounded-full border border-[#f1f0ea] text-xs font-bold hover:border-[#004d40]/30 transition-colors cursor-default select-none">
                      {cat}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </MainSection>
    </div>
  );
}
