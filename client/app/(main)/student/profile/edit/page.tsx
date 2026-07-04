"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { studentService } from "@/services/student.service";
import { uploadService } from "@/services/upload.service";
import {
  FiUser,
  FiBook,
  FiBriefcase,
  FiPhone,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiGlobe,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { FaGraduationCap, FaBriefcase as FaBriefcaseIcon, FaGlobe as FaGlobeIcon, FaCertificate, FaImage, FaTrash } from "react-icons/fa";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import { useToast } from "@/context/ToastContext";
import { StudentProfile, StudentSkill } from "@/types/student";
import SectionCard from "@/components/ui/cards/SectionCard";
import { useAuthStore } from "@/hooks/useAuth";
import { FormInput, FormButton, FormSelect, FormTextarea, LevelSlider } from "@/components/ui/form";
import MainSection from '@/components/layout/MainSection';
import Breadcrumb from "@/components/ui/Breadcrumb";

const studentProfileSchema = z.object({
  full_name: z.string().min(1, "Ad Soyad zorunludur"),
  university: z.string().optional(),
  bio: z
    .string()
    .max(2000, "Biyografi 2000 karakterden az olmalıdır")
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
  profile_image_url: z
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

export default function StudentProfileEditPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillLevel, setSkillLevel] = useState(5);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema) as any,
  });

  const {
    register: registerSkill,
    handleSubmit: handleSubmitSkill,
    reset: resetSkill,
    watch: watchSkill,
    formState: { errors: skillErrors },
  } = useForm<AddSkillFormData>({
    resolver: zodResolver(addSkillSchema),
    defaultValues: {
      category: "Yazılım",
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
      setValue("profile_image_url", data.profile_image_url || "");
      setProfileImageUrl(data.profile_image_url || "");
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await uploadService.uploadFile(file);
      setProfileImageUrl(response.url);
      setValue("profile_image_url", response.url);
      showToast("Profil resmi başarıyla yüklendi.", "success");
    } catch (error: any) {
      console.error("Failed to upload profile image:", error);
      showToast(error.message || "Fotoğraf yüklenemedi.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = () => {
    setProfileImageUrl("");
    setValue("profile_image_url", "");
    showToast("Profil resmi kaldırıldı. Kaydetmeyi unutmayın.", "info");
  };

  const checkAuth = useAuthStore((state) => state.checkAuth);

  const onProfileSubmit = async (data: StudentProfileFormData) => {
    setIsLoading(true);
    try {
      await studentService.updateProfile(data);
      await checkAuth();
      showToast("Profil başarıyla güncellendi.", "success");
      fetchProfile();
    } catch (error: any) {
      console.error("Profile update error:", error);
      showToast(
        error.response?.data?.message || "Profil güncellenirken bir hata oluştu.",
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

  if (isFetching) return <PageLoadingSkeleton />;

  return (
    <div className="w-full app-container px-4 md:px-8 py-10 flex flex-col gap-8 min-h-screen font-sans">
      <Breadcrumb
        items={[
          { label: "Öğrenci Profili", href: `/students/${profile?.user_id}` },
          { label: "Profili Düzenle", active: true },
        ]}
      />

      <div className="mb-2">
        <h1 className="text-3xl font-bold text-[#00342b] tracking-tight mb-2">Profili Düzenle</h1>
        <p className="text-[#565e74] font-medium text-sm">
          Kişisel bilgilerinizi, yeteneklerinizi ve sosyal medya bağlantılarınızı güncelleyin.
        </p>
      </div>

      <div className="w-full space-y-8">
        {/* ① Kişisel Bilgiler */}
        <SectionCard
          icon={FiUser}
          title="Kişisel Bilgiler"
          description="Profiliniz şirketler tarafından nasıl görünüyor?"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onProfileSubmit as any)}>
            
            {/* Profile Image Uploader */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#f1f0ea]">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#faf9f6] border border-[#dfded6] flex items-center justify-center shadow-2xs">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profil Resmi" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-extrabold uppercase tracking-widest animate-pulse">Yükleniyor</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="text-sm font-bold text-[#0b1c30]">Profil Resmi</h4>
                <p className="text-xs font-semibold text-gray-400">En fazla 10MB boyutunda JPEG, PNG yükleyebilirsiniz.</p>
                <div className="flex items-center gap-3 justify-center sm:justify-start pt-1">
                  <input
                    type="file"
                    accept="image/*"
                    id="profile-image-input"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <FormButton
                    type="button"
                    variant="outline"
                    className="!rounded-full px-5 py-2 !text-xs"
                    onClick={() => document.getElementById("profile-image-input")?.click()}
                  >
                    <FaImage className="mr-1.5" /> Fotoğraf Yükle
                  </FormButton>
                  {profileImageUrl && (
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      className="text-red-650 hover:text-red-700 font-bold text-xs uppercase tracking-wider pl-2"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormInput
                  label="Ad Soyad"
                  type="text"
                  {...register("full_name")}
                  className="!rounded-full px-5"
                  icon={FiUser}
                  error={errors.full_name?.message}
                />
              </div>
              <div>
                <FormInput
                  label="Telefon Numarası"
                  type="text"
                  {...register("phone")}
                  className="!rounded-full px-5"
                  icon={FiPhone}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormInput
                  label="Üniversite"
                  type="text"
                  {...register("university")}
                  className="!rounded-full px-5"
                  icon={FiBook}
                />
              </div>
              <div>
                <FormInput
                  label="Bölüm"
                  type="text"
                  {...register("major")}
                  className="!rounded-full px-5"
                  icon={FiBook}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormInput
                  label="Mezuniyet Yılı"
                  type="number"
                  {...register("graduation_year")}
                  className="!rounded-full px-5"
                  icon={FiBook}
                />
              </div>
              <div>
                <FormSelect
                  label="Müsaitlik Durumu"
                  {...register("availability_status")}
                  value={watch("availability_status")}
                  className="!rounded-full"
                  options={[
                    { value: "available", label: "Müsaitim (İş/Görev arıyorum)" },
                    { value: "busy", label: "Meşgulüm" }
                  ]}
                />
              </div>
            </div>

            <div>
              <FormInput
                label="İlgi Alanları (Virgülle ayırın)"
                type="text"
                {...register("categories_of_interest")}
                className="!rounded-full px-5"
                icon={FiBriefcase}
              />
            </div>

            <div>
              <FormTextarea
                label="Hakkımda"
                {...register("bio")}
                className="!rounded-2xl px-5 py-3"
                rows={4}
                error={errors.bio?.message}
              />
            </div>

            <div className="pt-4 border-t border-[#f1f0ea]">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Sosyal Bağlantılar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput label="LinkedIn" type="text" {...register("linkedin_url")} className="!rounded-full px-5" icon={FiLinkedin} error={errors.linkedin_url?.message} />
                <FormInput label="GitHub" type="text" {...register("github_url")} className="!rounded-full px-5" icon={FiGithub} error={errors.github_url?.message} />
                <FormInput label="Twitter (X)" type="text" {...register("twitter_url")} className="!rounded-full px-5" icon={FiTwitter} error={errors.twitter_url?.message} />
                <FormInput label="Web Sitesi" type="text" {...register("website_url")} className="!rounded-full px-5" icon={FiGlobe} error={errors.website_url?.message} />
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <FormButton type="submit" className="!rounded-full px-8" isLoading={isLoading}>
                Değişiklikleri Kaydet
              </FormButton>
            </div>
          </form>
        </SectionCard>

        {/* ② Yetenekler */}
        <SectionCard
          icon={FiBriefcase}
          title="Yetenekler"
          description="Sahip olduğunuz yetenekleri ve seviyelerini belirleyin."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Yeni Yetenek Ekle */}
            <div className="bg-transparent rounded-xl p-6 border border-[#f1f0ea]">
              <h3 className="font-semibold text-gray-900 mb-1">Yeni Yetenek Ekle</h3>
              <p className="text-xs text-gray-500 mb-5">Profilinize yeni yetenekler ekleyin</p>
              
              <form onSubmit={handleSubmitSkill(onAddSkill)} className="space-y-4">
                <FormInput
                  label="Yetenek Adı"
                  type="text"
                  {...registerSkill("skillName")}
                  className="!rounded-full px-5"
                  placeholder="Örn: React, Photoshop"
                  error={skillErrors.skillName?.message}
                />
                
                <FormSelect
                  label="Kategori"
                  {...registerSkill("category")}
                  value={watchSkill("category")}
                  className="!rounded-full"
                  options={[
                    { value: "Yazılım", label: "Yazılım" },
                    { value: "Tasarım", label: "Tasarım" },
                    { value: "Pazarlama", label: "Pazarlama" },
                    { value: "Dil", label: "Dil" },
                    { value: "Diğer", label: "Diğer" }
                  ]}
                  error={skillErrors.category?.message}
                />
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                    Seviye <span className="text-red-500">*</span>
                  </label>
                  <div className="p-1">
                    <LevelSlider value={skillLevel} onChange={setSkillLevel} />
                  </div>
                </div>
                
                <FormButton type="submit" isLoading={isAddingSkill} className="w-full !rounded-full">
                  <FiPlus className="mr-2 inline" /> Yetenek Ekle
                </FormButton>
              </form>
            </div>

            {/* Mevcut Yetenekler */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Mevcut Yeteneklerim</h3>
              <p className="text-xs text-gray-500 mb-5">Yeteneklerinizi yönetin ve düzenleyin</p>
              
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
                    <div key={category} className="bg-transparent rounded-xl p-5 border border-[#f1f0ea] hover:border-[#004d40]/30 transition-all">
                      <h4 className="text-[10px] font-bold text-[#004d40] mb-3 uppercase tracking-widest">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => {
                          const filled = Math.round((skill.level / 10) * 5);
                          const color = skill.level <= 2 ? "#ef4444" : skill.level <= 4 ? "#fb923c" : skill.level <= 6 ? "#facc15" : skill.level <= 8 ? "#e28743" : "#004d40";
                          return (
                            <div key={skill.skill.id} className="flex items-center gap-2 bg-white border border-[#f1f0ea] px-3 py-2 rounded-full transition-all hover:border-[#004d40]/30">
                              <span className="text-sm font-semibold text-gray-700">{skill.skill.name}</span>
                              <span className="flex items-end gap-0.5" title={`Seviye: ${skill.level}/10`}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <span key={i} style={{ width: 3, height: 4 + i * 2, borderRadius: 2, backgroundColor: i <= filled ? color : "#e5e7eb", display: "inline-block" }} />
                                ))}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">{skill.level}/10</span>
                              <button type="button" onClick={() => onRemoveSkill(skill.skill.id)} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer ml-1" title="Sil">
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
                <div className="text-center py-12 text-gray-400 bg-transparent rounded-xl border border-dashed border-gray-200">
                  <FiBriefcase className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-sm">Henüz yetenek eklenmemiş.</p>
                  <p className="text-xs mt-1 font-medium">Sol taraftaki formu kullanarak yetenek ekleyin.</p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
