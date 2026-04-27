"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/ui/Button";
import { studentService } from "@/services/student.service";
import {
  FiSave,
  FiUser,
  FiBook,
  FiFileText,
  FiTrash2,
  FiPlus,
  FiPhone,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiGlobe,
  FiSettings,
  FiBriefcase,
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import { StudentProfile, StudentSkill } from "@/types/student";
import { authService } from "@/services/auth.service";



const studentProfileSchema = z.object({
  full_name: z.string().min(1, "Ad Soyad zorunludur"),
  university: z.string().optional(),
  bio: z
    .string()
    .max(1000, "Biyografi 1000 karakterden az olmalıdır")
    .optional(),
  phone: z.string().optional(),
  linkedin_url: z
    .string()
    .url("Geçersiz URL formatı")
    .optional()
    .or(z.literal("")),
  github_url: z
    .string()
    .url("Geçersiz URL formatı")
    .optional()
    .or(z.literal("")),
  twitter_url: z
    .string()
    .url("Geçersiz URL formatı")
    .optional()
    .or(z.literal("")),
  website_url: z
    .string()
    .url("Geçersiz URL formatı")
    .optional()
    .or(z.literal("")),
  major: z.string().optional().or(z.literal("")),
  graduation_year: z.coerce.number().optional(),
  availability_status: z.string().optional(),
  categories_of_interest: z.string().optional().or(z.literal("")),
});



const addSkillSchema = z.object({
  skillName: z.string().min(1, "Yetenek adı zorunludur"),
  category: z.string().min(1, "Kategori zorunludur"),
  level: z.number().int().min(1).max(10),
});

type StudentProfileFormData = z.infer<typeof studentProfileSchema>;
type AddSkillFormData = z.infer<typeof addSkillSchema>;

export default function StudentSettingsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "skills" | "security">(
    "profile"
  );
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [skillLevel, setSkillLevel] = useState(5);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema) as any,
  });

  const {
    register: registerSkill,
    handleSubmit: handleSubmitSkill,
    reset: resetSkill,
    formState: { errors: skillErrors },
  } = useForm<AddSkillFormData>({
    resolver: zodResolver(addSkillSchema),
    defaultValues: {
      category: "General",
      level: 5,
    },
  });

  const fetchProfile = async () => {
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      setValue("full_name", data.full_name);
      setValue("university", data.university || "");
      setValue("bio", data.bio || "");
      setValue("phone", data.phone || "");
      setValue("linkedin_url", data.linkedin_url || "");
      setValue("github_url", data.github_url || "");
      setValue("twitter_url", data.twitter_url || "");
      setValue("website_url", data.website_url || "");
      setValue("major", data.major || "");
      setValue("graduation_year", data.graduation_year || undefined);
      setValue("availability_status", data.availability_status || "available");
      setValue("categories_of_interest", data.categories_of_interest || "");
    } catch (error) {
      console.error("Failed to fetch profile", error);
      showToast("Profil bilgileri yüklenemedi.", "error");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [setValue, showToast]);

  const onProfileSubmit = async (data: StudentProfileFormData) => {
    setIsLoading(true);
    try {
      await studentService.updateProfile(data);
      showToast("Profil başarıyla güncellendi.", "success");
      fetchProfile();
    } catch (error: any) {
      console.error("Profile update error:", error);
      showToast(
        error.response?.data?.message ||
          "Profil güncellenirken bir hata oluştu.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onAddSkill = async (data: AddSkillFormData) => {
    setIsAddingSkill(true);
    try {
      await studentService.addSkill(data.skillName, data.category, skillLevel);
      showToast("Yetenek başarıyla eklendi.", "success");
      resetSkill();
      setSkillLevel(5);
      fetchProfile();
    } catch (error: any) {
      console.error("Add skill error:", error);
      showToast(
        error.response?.data?.message || "Yetenek eklenirken bir hata oluştu.",
        "error"
      );
    } finally {
      setIsAddingSkill(false);
    }
  };

  const onRemoveSkill = async (skillId: number) => {
    if (!confirm("Bu yeteneği silmek istediğinize emin misiniz?")) return;
    try {
      await studentService.removeSkill(skillId);
      showToast("Yetenek başarıyla silindi.", "success");
      fetchProfile();
    } catch (error: any) {
      console.error("Remove skill error:", error);
      showToast(
        error.response?.data?.message || "Yetenek silinirken bir hata oluştu.",
        "error"
      );
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      showToast("Yeni şifreler eşleşmiyor.", "error");
      return;
    }
    if (pw.next.length < 6) {
      showToast("Yeni şifre en az 6 karakter olmalıdır.", "error");
      return;
    }
    setPwLoading(true);
    try {
      await authService.changePassword(pw.current, pw.next);
      showToast("Şifreniz başarıyla değiştirildi.", "success");
      setPw({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      showToast(err.response?.data?.message || "Şifre değiştirilemedi.", "error");
    } finally {
      setPwLoading(false);
    }
  };

  if (isFetching)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#004d40] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );

  const sectionTabs = [
    { key: "profile" as const, label: "Kişisel Bilgiler", icon: FiUser },
    { key: "skills" as const, label: "Yetenekler", icon: FiBriefcase },
    { key: "security" as const, label: "Güvenlik", icon: FiSettings },
  ];

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#004d40]/15 focus:border-[#004d40] outline-none transition-all hover:border-gray-300 text-[#004d40] font-medium placeholder:text-gray-400 placeholder:font-normal";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40]">
          <FiSettings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Ayarları</h1>
          <p className="text-sm text-gray-500">
            Kişisel bilgilerinizi ve yeteneklerinizi yönetin
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-2">
          {sectionTabs.map((tab) => {
            const isActive = activeSection === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all relative ${
                  isActive
                    ? "text-[#004d40]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#004d40] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-8">


          {activeSection === "profile" && (
            <form
              onSubmit={handleSubmit(onProfileSubmit as any)}
              className="space-y-6 max-w-2xl"
            >


              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                  <FiUser className="w-4 h-4" />
                  Ad Soyad
                </label>
                <input
                  type="text"
                  {...register("full_name")}
                  className={inputClass}
                  placeholder="Ad Soyad"
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.full_name.message}
                  </p>
                )}
              </div>



              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                  <FiBook className="w-4 h-4" />
                  Üniversite / Okul
                </label>
                <input
                  type="text"
                  {...register("university")}
                  className={inputClass}
                  placeholder="Üniversite Adı"
                />
              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                    <FiBook className="w-4 h-4" />
                    Bölüm / Uzmanlık
                  </label>
                  <input
                    type="text"
                    {...register("major")}
                    className={inputClass}
                    placeholder="Örn: Yazılım Mühendisliği"
                  />
                </div>
                <div className="group">
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                    <FiBook className="w-4 h-4" />
                    Mezuniyet Yılı
                  </label>
                  <input
                    type="number"
                    {...register("graduation_year")}
                    className={inputClass}
                    placeholder="Örn: 2025"
                  />
                </div>
              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                    <FiBriefcase className="w-4 h-4" />
                    İlgi Alanları
                  </label>
                  <input
                    type="text"
                    {...register("categories_of_interest")}
                    className={inputClass}
                    placeholder="Örn: Yazılım, Tasarım (Virgülle ayırın)"
                  />
                </div>
                <div className="group">
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                    <FiUser className="w-4 h-4" />
                    Müsaitlik Durumu
                  </label>
                  <select
                    {...register("availability_status")}
                    className={`${inputClass} bg-white`}
                  >
                    <option value="available">Müsaitim (İş/Görev arıyorum)</option>
                    <option value="busy">Meşgulüm</option>
                  </select>
                </div>
              </div>



              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                  <FiFileText className="w-4 h-4" />
                  Hakkımda
                </label>
                <textarea
                  {...register("bio")}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Kendinizden bahsedin..."
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bio.message}
                  </p>
                )}
              </div>



              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                  <FiPhone className="w-4 h-4" />
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  {...register("phone")}
                  className={inputClass}
                  placeholder="05XX XXX XX XX"
                />
              </div>



              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Sosyal Bağlantılar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                      <FiLinkedin className="w-4 h-4" />
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      {...register("linkedin_url")}
                      className={inputClass}
                      placeholder="https://linkedin.com/in/..."
                    />
                    {errors.linkedin_url && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.linkedin_url.message}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                      <FiGithub className="w-4 h-4" />
                      GitHub
                    </label>
                    <input
                      type="text"
                      {...register("github_url")}
                      className={inputClass}
                      placeholder="https://github.com/..."
                    />
                    {errors.github_url && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.github_url.message}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                      <FiTwitter className="w-4 h-4" />
                      Twitter (X)
                    </label>
                    <input
                      type="text"
                      {...register("twitter_url")}
                      className={inputClass}
                      placeholder="https://twitter.com/..."
                    />
                    {errors.twitter_url && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.twitter_url.message}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 group-focus-within:text-[#004d40] transition-colors">
                      <FiGlobe className="w-4 h-4" />
                      Web Sitesi
                    </label>
                    <input
                      type="text"
                      {...register("website_url")}
                      className={inputClass}
                      placeholder="https://..."
                    />
                    {errors.website_url && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.website_url.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-100">
                <Button
                  type="submit"
                  variant="primary"
                  className="min-w-40 rounded-xl py-3"
                  isLoading={isLoading}
                  icon={FiSave}
                >
                  Kaydet
                </Button>
              </div>
            </form>
          )}



          {activeSection === "skills" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">


              <div>
                <div className="bg-gray-50/80 rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Yeni Yetenek Ekle
                  </h3>
                  <p className="text-xs text-gray-500 mb-5">
                    Profilinize yeni yetenekler ekleyin
                  </p>
                  <form
                    onSubmit={handleSubmitSkill(onAddSkill)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Yetenek Adı
                      </label>
                      <input
                        type="text"
                        {...registerSkill("skillName")}
                        className={inputClass}
                        placeholder="Örn: React, Photoshop"
                      />
                      {skillErrors.skillName && (
                        <p className="text-red-500 text-xs mt-1">
                          {skillErrors.skillName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Kategori
                      </label>
                      <select
                        {...registerSkill("category")}
                        className={`${inputClass} bg-white`}
                      >
                        <option value="Yazılım">Yazılım</option>
                        <option value="Tasarım">Tasarım</option>
                        <option value="Pazarlama">Pazarlama</option>
                        <option value="Dil">Dil</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                      {skillErrors.category && (
                        <p className="text-red-500 text-xs mt-1">
                          {skillErrors.category.message}
                        </p>
                      )}
                    </div>



                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seviye <span className="text-red-500">*</span>
                      </label>
                      {(() => {
                        const r = 16;
                        const circ = 2 * Math.PI * r;
                        const progress = (skillLevel / 10) * circ;
                        const levelColor = skillLevel <= 2 ? "#ef4444" : skillLevel <= 4 ? "#fb923c" : skillLevel <= 6 ? "#facc15" : skillLevel <= 8 ? "#84cc16" : "#22c55e";
                        const levelLabel = skillLevel <= 2 ? "Başlangıç" : skillLevel <= 4 ? "Temel" : skillLevel <= 6 ? "Orta" : skillLevel <= 8 ? "İleri" : "Uzman";
                        return (
                          <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl bg-white">
                            <button type="button" onClick={() => setSkillLevel(Math.max(1, skillLevel - 1))} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 bg-white text-gray-500 hover:text-gray-800 transition-all text-sm font-bold shadow-sm">−</button>
                            <div className="relative flex items-center justify-center" style={{ width: 52, height: 52 }}>
                              <svg width="52" height="52" viewBox="0 0 44 44" className="-rotate-90">
                                <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                <circle cx="22" cy="22" r={r} fill="none" stroke={levelColor} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress} ${circ}`} style={{ transition: "stroke-dasharray 0.25s ease, stroke 0.25s ease" }} />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-semibold text-gray-700 leading-none">
                                  {skillLevel}<span className="text-[8px] font-normal text-gray-400">/10</span>
                                </span>
                              </div>
                            </div>
                            <button type="button" onClick={() => setSkillLevel(Math.min(10, skillLevel + 1))} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 bg-white text-gray-500 hover:text-gray-800 transition-all text-sm font-bold shadow-sm">+</button>
                            <span className="text-sm font-medium" style={{ color: levelColor }}>{levelLabel}</span>
                          </div>
                        );
                      })()}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full rounded-xl py-3"
                      isLoading={isAddingSkill}
                      icon={FiPlus}
                    >
                      Ekle
                    </Button>
                  </form>
                </div>
              </div>



              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Yeteneklerim
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                  Mevcut yeteneklerinizi yönetin
                </p>
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="space-y-5">
                    {Object.entries(
                      profile.skills.reduce((acc, skill) => {
                        const cat = skill.category || "Diğer";
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(skill);
                        return acc;
                      }, {} as Record<string, StudentSkill[]>)
                    ).map(([category, skills]) => (
                      <div key={category} className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
                        <h4 className="text-xs font-semibold text-[#004d40] mb-3 uppercase tracking-wide">
                          {category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => {
                            const filled = Math.round((skill.level / 10) * 5);
                            const color = skill.level <= 2 ? "#ef4444" : skill.level <= 4 ? "#fb923c" : skill.level <= 6 ? "#facc15" : skill.level <= 8 ? "#84cc16" : "#22c55e";
                            return (
                              <div
                                key={skill.skill.id}
                                className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all group"
                              >
                                <span className="text-sm text-gray-700">
                                  {skill.skill.name}
                                </span>
                                <span className="flex items-end gap-0.5" title={`Seviye: ${skill.level}/10`}>
                                  {[1,2,3,4,5].map(i => (
                                    <span key={i} style={{ width: 3, height: 4 + i * 2, borderRadius: 2, backgroundColor: i <= filled ? color : "#e5e7eb", display: "inline-block", transition: "background-color 0.2s" }} />
                                  ))}
                                </span>
                                <span className="text-[10px] text-gray-400">{skill.level}/10</span>
                                <button
                                  onClick={() => onRemoveSkill(skill.skill.id)}
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                  title="Sil"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FiBriefcase className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p>Henüz yetenek eklenmemiş.</p>
                    <p className="text-xs mt-1">
                      Sol taraftaki formu kullanarak yetenek ekleyin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="max-w-md space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Şifre Değiştir</h3>
                <p className="text-sm text-gray-500">Güvenliğiniz için düzenli aralıklarla şifrenizi güncelleyin.</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mevcut Şifre</label>
                  <input
                    type="password"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    className={inputClass}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre</label>
                  <input
                    type="password"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    className={inputClass}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    className={inputClass}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 mt-4"
                  isLoading={pwLoading}
                >
                  Şifreyi Güncelle
                </Button>
              </form>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-red-600 mb-2">Hesabı Devre Dışı Bırak</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Hesabınızı devre dışı bıraktığınızda profiliniz şirketler tarafından görünmez hale gelir.
                </p>
                <button 
                  type="button"
                  className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                  onClick={() => showToast("Bu özellik yakında eklenecektir.", "info")}
                >
                  Hesabımı Pasife Al
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
