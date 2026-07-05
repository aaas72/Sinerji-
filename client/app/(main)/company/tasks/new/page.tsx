"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FiBookOpen,
  FiPlus,
  FiTrash2,
  FiX,
  FiDollarSign,
  FiAward,
  FiCheck,
  FiZap,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import { taskService } from "@/services/task.service";
import { TASK_CATEGORIES } from "@/constants/categories";
import RichTextEditor from "@/components/ui/form/RichTextEditor";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionCard from "@/components/ui/cards/SectionCard";
import { cn } from "@/utils/cn";

// Form Schema
const createTaskSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır."),
  description: z.string().min(20, "Açıklama en az 20 karakter olmalıdır."),
  category: z.string().min(1, "Kategori seçiniz."),
  subcategory: z.string().min(1, "Alt kategori seçiniz."),
  reward_type: z.string().min(1, "Ödül türü seçiniz."),
  budget: z.any().optional(),
  currency: z.string().optional(),
  internship_duration: z.string().optional(),
  internship_department: z.string().optional(),
  certificate_name: z.string().optional(),
  certificate_issuer: z.string().optional(),
  positions: z.number().min(1, "En az 1 pozisyon olmalıdır."),
  experience_level: z.string().min(1, "Deneyim seviyesi seçiniz."),
  preferred_major: z.string().optional(),
  work_type: z.string().min(1, "Çalışma şekli seçiniz."),
  deadline: z.string().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface SkillItem {
  skill: string;
  level: number;
  isRequired?: boolean;
  yearsOfExperience?: number;
}

export default function NewTaskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Skill states
  const [hardSkills, setHardSkills] = useState<SkillItem[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [hardSkillInput, setHardSkillInput] = useState("");
  const [hardSkillLevel, setHardSkillLevel] = useState(5);
  const [hardSkillIsRequired, setHardSkillIsRequired] = useState(false);
  const [hardSkillYears, setHardSkillYears] = useState<number | "">("");
  const [softSkillInput, setSoftSkillInput] = useState("");
  const [activeRewardTab, setActiveRewardTab] = useState<string>("money");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      positions: 1,
      currency: "TRY",
      reward_type: "money",
      experience_level: "beginner",
      work_type: "remote"
    },
  });

  const selectedCategory = watch("category");
  const watchedRewardType = watch("reward_type");

  const availableSubcategories = useMemo(() => {
    const cat = TASK_CATEGORIES.find((c) => c.value === selectedCategory);
    return cat ? cat.subcategories : [];
  }, [selectedCategory]);

  const handleAddHardSkill = () => {
    if (!hardSkillInput.trim()) return;
    if (hardSkills.some((s) => s.skill.toLowerCase() === hardSkillInput.toLowerCase())) {
      setHardSkillInput("");
      return;
    }

    const newSkill: SkillItem = {
      skill: hardSkillInput.trim(),
      level: hardSkillLevel,
      isRequired: hardSkillIsRequired,
      yearsOfExperience: hardSkillYears === "" ? undefined : hardSkillYears,
    };

    setHardSkills([...hardSkills, newSkill]);
    setHardSkillInput("");
    setHardSkillLevel(5);
    setHardSkillIsRequired(false);
    setHardSkillYears("");
  };

  const handleRemoveHardSkill = (skillName: string) => {
    setHardSkills(hardSkills.filter((s) => s.skill !== skillName));
  };

  const handleAddSoftSkill = () => {
    if (!softSkillInput.trim()) return;
    if (softSkills.some((s) => s.toLowerCase() === softSkillInput.toLowerCase())) {
      setSoftSkillInput("");
      return;
    }
    setSoftSkills([...softSkills, softSkillInput.trim()]);
    setSoftSkillInput("");
  };

  const handleRemoveSoftSkill = (skillName: string) => {
    setSoftSkills(softSkills.filter((s) => s !== skillName));
  };

  const onSubmit = async (data: CreateTaskFormData) => {
    if (hardSkills.length === 0) {
      setFormError("En az bir teknik yetenek eklemelisiniz.");
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);
      const payload = {
        ...data,
        hardSkills: hardSkills.map(s => ({
          skill: s.skill,
          level: s.level,
          isRequired: s.isRequired,
          yearsOfExperience: s.yearsOfExperience
        })),
        softSkills: softSkills,
        budget: data.budget ? String(data.budget) : undefined,
        positions: Number(data.positions),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      };

      await taskService.createTask(payload);
      router.push("/company/tasks");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      console.error("Task create error:", error);
      setFormError(error?.response?.data?.message || error?.message || "Görev oluşturulurken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#0b1c30] antialiased pb-32">
      <main className="app-container px-6 py-8">
        {/* Header & Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/company/dashboard" },
              { label: "Tasks", href: "/company/tasks" },
              { label: "New Task", active: true }
            ]}
          />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h1 className="text-3xl font-bold text-primary tracking-tight">Yeni Görev Yayınla</h1>
          </div>
        </div>

        {formError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Core Info & Skills */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Information Card */}
            <SectionCard icon={FiBookOpen} title="Temel Bilgiler">

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Görev Başlığı</label>
                  <Input
                    {...register("title")}
                    className="px-4 py-3 text-lg font-bold text-primary"
                    placeholder="Görev Başlığını Giriniz"
                    error={!!errors.title}
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Görev Açıklaması</label>
                  <div className="rounded-4xl border border-[#DFDED6]  overflow-hidden focus-within:ring-1 focus-within:ring-primary/8 transition-all">
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Görev detaylarını buraya yazınız..."
                        />
                      )}
                    />
                  </div>
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Kategori</label>
                    <Select
                      {...register("category")}
                      className="px-4 py-3 text-sm font-medium"
                      onChange={(e) => {
                        setValue("category", e.target.value);
                        setValue("subcategory", "");
                      }}
                      error={!!errors.category}
                    >
                      <option value="">Seçiniz</option>
                      {TASK_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Alt Kategori</label>
                    <Select
                      {...register("subcategory")}
                      disabled={!selectedCategory}
                      className="px-4 py-3 text-sm font-medium"
                      error={!!errors.subcategory}
                    >
                      <option value="">{selectedCategory ? "Seçiniz" : "Önce kategori seçiniz"}</option>
                      {availableSubcategories.map(sub => (
                        <option key={sub.value} value={sub.value}>{sub.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Tercih Edilen Bölüm</label>
                  <Input
                    {...register("preferred_major")}
                    className="px-4 py-3 text-sm font-medium"
                    placeholder="Bilgisayar Mühendisliği, Yazılım Mühendisliği..."
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#3f4945] mb-1.5 uppercase tracking-wider">Pozisyon Sayısı</label>
                    <Input
                      type="number"
                      min={1}
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                      {...register("positions", { valueAsNumber: true })}
                      className="px-3 py-2 text-sm font-bold"
                      error={!!errors.positions}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#3f4945] mb-1.5 uppercase tracking-wider">Deneyim</label>
                    <Select
                      {...register("experience_level")}
                      className="px-3 py-2 text-sm font-bold"
                      error={!!errors.experience_level}
                    >
                      <option value="beginner">Entry / Junior</option>
                      <option value="intermediate">Mid-Level</option>
                      <option value="advanced">Senior</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#3f4945] mb-1.5 uppercase tracking-wider">Çalışma Şekli</label>
                    <Select
                      {...register("work_type")}
                      className="px-3 py-2 text-sm font-bold"
                      error={!!errors.work_type}
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#3f4945] mb-1.5 uppercase tracking-wider">Son Başvuru</label>
                    <Input
                      type="date"
                      {...register("deadline")}
                      className="px-3 py-2 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Skill Management Card (AI Core) */}
            <SectionCard icon={HiSparkles} title={<span>Yetenek Yönetimi <span className="text-primary/50 text-sm font-normal ml-2">(AI Core)</span></span>}>

              {/* Skill Input Adder */}
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Yetenek adı (Örn: React, Node.js)"
                    value={hardSkillInput}
                    onChange={(e) => setHardSkillInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-sm"
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Seviye:</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={hardSkillLevel}
                        onChange={(e) => setHardSkillLevel(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none accent-primary cursor-pointer"
                      />
                      <span className="text-xs font-bold text-primary w-6">{hardSkillLevel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <ToggleSwitch
                      checked={hardSkillIsRequired}
                      onChange={setHardSkillIsRequired}
                      label="Zorunlu"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Deneyim (Yıl):</span>
                      <Input
                        type="number"
                        placeholder="Yıl"
                        value={hardSkillYears}
                        min={0}
                        onChange={(e) => setHardSkillYears(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                        className="!w-16 px-2 py-1 text-xs text-center font-bold"
                      />
                    </div>
                  </div>
                  <PrimaryButton
                    type="button"
                    onClick={handleAddHardSkill}
                    icon={FiPlus}
                    className="px-6 py-2 rounded-4xl text-xs font-bold shadow-lg shadow-primary/20 active:scale-95"
                  >
                    Listeye Ekle
                  </PrimaryButton>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <h3 className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider px-1">Hard Skills</h3>
                <div className="space-y-3">
                  {hardSkills.map((h, index) => (
                    <div key={h.skill} className="bg-white p-4 rounded-4xl border border-[#F1F0EA] flex flex-col md:flex-row md:items-center gap-4 group/item hover:border-primary/30 transition-all">
                      <div className="md:w-1/4">
                        <span className="font-bold text-[#00342b]">{h.skill}</span>
                      </div>

                      <div className="flex-1 flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={h.level}
                          onChange={(e) => {
                            const newSkills = [...hardSkills];
                            newSkills[index].level = Number(e.target.value);
                            setHardSkills(newSkills);
                          }}
                          className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none accent-[#00342b] cursor-pointer"
                        />
                        <span className="text-xs font-medium text-slate-500 w-8">{h.level}/10</span>

                        <ToggleSwitch
                          checked={h.isRequired || false}
                          onChange={(checked) => {
                            const newSkills = [...hardSkills];
                            newSkills[index].isRequired = checked;
                            setHardSkills(newSkills);
                          }}
                          label="Zorunlu"
                          className="ml-2"
                        />
                      </div>

                      <div className="md:w-1/4 flex items-center justify-end gap-6">
                        <div className="flex flex-col min-w-[60px]">
                          {h.yearsOfExperience ? (
                            <>
                              <span className="text-[10px] text-slate-400">Deneyim:</span>
                              <span className="text-xs font-bold text-[#00342b]">{h.yearsOfExperience} Yıl</span>
                            </>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveHardSkill(h.skill)}
                          className="text-red-500 border border-red-100 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {hardSkills.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-[#DFDED6] rounded-2xl text-[#565e74] text-sm font-medium">
                      Henüz teknik yetenek eklenmedi.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider px-1">Soft Skills</h3>
                <div className="flex flex-wrap gap-2 p-4 rounded-4xl border border-dashed border-[#DFDED6]">
                  {softSkills.map((s) => (
                    <span key={s} className="bg-white border border-[#DFDED6] text-[#5c647a] px-3 py-1.5 rounded-4xl text-xs font-bold flex items-center gap-2 group/tag animate-in fade-in zoom-in">
                      {s}
                      <button type="button" onClick={() => handleRemoveSoftSkill(s)} className="hover:text-red-500 transition-colors">
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <Input
                    type="text"
                    value={softSkillInput}
                    onChange={(e) => setSoftSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSoftSkill())}
                    className="w-auto px-2 py-1 text-sm placeholder:text-slate-500 min-w-[120px]"
                    placeholder="Enter ile ekle..."
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right Column: Reward Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            {/* Reward Section */}
            <SectionCard icon={FiAward} title="Ödül Türü Seçiniz">


              <div className="space-y-6">
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["money", "internship", "certificate"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setValue("reward_type", type);
                          setActiveRewardTab(type);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 py-3 rounded-4xl border transition-all duration-300",
                          (watchedRewardType === type || activeRewardTab === type)
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                            : "bg-white border-[#DFDED6] text-slate-400 hover:border-primary/30"
                        )}
                      >
                        {type === "money" && <FiDollarSign className="w-5 h-5" />}
                        {type === "internship" && <FiAward className="w-5 h-5" />}
                        {type === "certificate" && <FiCheck className="w-5 h-5" />}
                        <span className="text-[9px] font-extrabold uppercase">{type === "money" ? "Nakit" : type === "internship" ? "Staj" : "Belge"}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  {watchedRewardType === "money" && (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Bütçe</label>
                          <Input
                            type="number"
                            min={0}
                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                            {...register("budget")}
                            className="px-4 py-3 font-bold text-primary"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Para</label>
                          <Select
                            {...register("currency")}
                            className="px-4 py-3 font-bold"
                          >
                            <option value="TRY">TRY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </Select>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic text-center">Nakit ödüller, görev tamamlandıktan sonra onaylanan hesaba 3 iş günü içinde aktarılır.</p>
                    </div>
                  )}

                  {watchedRewardType === "internship" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Staj Süresi</label>
                        <Select
                          {...register("internship_duration")}
                          className="px-4 py-3 font-bold"
                        >
                          <option value="1 month">1 Ay</option>
                          <option value="3 months">3 Ay</option>
                          <option value="6 months">6 Ay</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Departman</label>
                        <Input
                          {...register("internship_department")}
                          className="px-4 py-3 font-bold"
                          placeholder="Pazarlama / Yazılım..."
                        />
                      </div>
                    </div>
                  )}

                  {watchedRewardType === "certificate" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Sertifika Adı</label>
                        <Input
                          {...register("certificate_name")}
                          className="px-4 py-3 font-bold rounded-xl bg-[#faf9f6] border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Kurum</label>
                        <Input
                          {...register("certificate_issuer")}
                          className="px-4 py-3 font-bold rounded-xl bg-[#faf9f6] border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

          </aside>
        </form>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-max z-50">
        <div className="bg-white/40 backdrop-blur-md rounded-[50px] p-2 shadow-2xl border border-[#DFDED6] flex items-center gap-2">
          <PrimaryButton
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-[50px] font-bold border-transparent hover:bg-white/50 transition-colors"
          >
            İptal
          </PrimaryButton>
          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            onClick={handleSubmit(onSubmit)}
            icon={FiPlus}
            className="px-8 py-3 rounded-[50px] font-bold active:scale-[0.98] shadow-xl shadow-primary/20 text-sm"
          >
            Görevi Yayınla
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
