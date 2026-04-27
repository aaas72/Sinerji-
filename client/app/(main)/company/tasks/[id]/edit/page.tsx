"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Breadcrumb from "@/components/ui/Breadcrumb";
import RichTextEditor from "@/components/ui/form/RichTextEditor";
import {
  FormCard,
  FormInput,
  FormTextarea,
  FormSelect,
  FormRow,
  FormSection,
  FormButton,
} from "@/components/ui/form";
import { FiX, FiPlus, FiDollarSign, FiCalendar } from "react-icons/fi";
import { taskService } from "@/services/task.service";
import { TASK_CATEGORIES, getSubcategories } from "@/constants/categories";

const editTaskSchema = z.object({
  title: z.string().min(1, "Görev başlığı zorunludur"),
  description: z.string().min(10, "Açıklama zorunludur ve en az 10 karakter olmalı"),
  category: z.string().min(1, "Kategori seçimi zorunludur"),
  subcategory: z.string().min(1, "Alt kategori seçimi zorunludur"),
  hardSkills: z.array(z.object({
    skill: z.string().min(1),
    level: z.number().min(1).max(10),
    isRequired: z.boolean(),
    yearsOfExperience: z.number().min(0).optional(),
  })).min(1, "En az bir teknik yetenek eklenmeli"),
  softSkills: z.array(z.string()).optional(),
  reward_type: z.string().optional(),
  budget: z.string().optional(),
  currency: z.string().optional(),
  internship_duration: z.string().optional(),
  internship_department: z.string().optional(),
  internship_is_paid: z.string().optional(),
  certificate_name: z.string().optional(),
  certificate_issuer: z.string().optional(),
  positions: z.number().min(1, "Pozisyon sayısı zorunludur"),
  experience_level: z.string().min(1, "Seviye seçimi zorunludur"),
  preferred_major: z.string().optional(),
  work_type: z.string().min(1, "Çalışma tipi zorunludur"),
  deadline: z.string().optional(),
  status: z.enum(["open", "review", "in_progress", "closed"]).optional(),
});

type EditTaskFormData = z.infer<typeof editTaskSchema>;

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = Number(params.id);

  const [hardSkills, setHardSkills] = useState<{ skill: string; level: number; isRequired: boolean; yearsOfExperience?: number }[]>([]);
  const [hardSkillInput, setHardSkillInput] = useState("");
  const [hardSkillLevel, setHardSkillLevel] = useState(5);
  const [hardSkillIsRequired, setHardSkillIsRequired] = useState(true);
  const [hardSkillYears, setHardSkillYears] = useState<number | "">("");
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [softSkillInput, setSoftSkillInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
  });

  const selectedCategory = watch("category");
  const availableSubcategories = selectedCategory ? getSubcategories(selectedCategory) : [];
  const watchedRewardType = watch("reward_type");

  useEffect(() => {
    setValue("hardSkills", hardSkills, { shouldValidate: true });
  }, [hardSkills, setValue]);

  useEffect(() => {
    setValue("softSkills", softSkills, { shouldValidate: true });
  }, [softSkills, setValue]);

  // ─── Fetch existing task data ──────────────────────────────────────────────
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const task = await taskService.getTaskById(taskId);

        setValue("title", task.title || "");
        setValue("description", task.description || "");
        setValue("reward_type", task.reward_type || "");
        setValue("category", task.category || "");
        setValue("subcategory", "");
        setTimeout(() => setValue("subcategory", task.subcategory || ""), 50);

        if (task.deadline) {
          setValue("deadline", new Date(task.deadline).toISOString().split("T")[0]);
        }

        if (task.positions) setValue("positions", Number(task.positions));
        if (task.experience_level) setValue("experience_level", task.experience_level);
        if (task.work_type) setValue("work_type", task.work_type);
        if (task.status) setValue("status", task.status as any);

        if (task.budget) setValue("budget", String(task.budget));
        if (task.currency) setValue("currency", task.currency);
        if (task.internship_duration) setValue("internship_duration", task.internship_duration);
        if (task.internship_department) setValue("internship_department", task.internship_department);
        if (task.internship_is_paid) setValue("internship_is_paid", task.internship_is_paid);
        if (task.certificate_name) setValue("certificate_name", task.certificate_name);
        if (task.certificate_issuer) setValue("certificate_issuer", task.certificate_issuer);

        // requiredSkills → hard skills with default values
        if (task.requiredSkills && Array.isArray(task.requiredSkills)) {
          setHardSkills(task.requiredSkills.map((s: { skill?: { name: string } | string; level?: number; isRequired?: boolean; yearsOfExperience?: number } | string) => {
            const skillSource = typeof s === "string" 
              ? s 
              : (typeof s.skill === "string" ? s.skill : s.skill?.name ?? "");
            return {
              skill: skillSource,
              level: typeof s === "object" && s !== null ? s.level ?? 5 : 5,
              isRequired: typeof s === "object" && s !== null ? s.isRequired ?? true : true,
              yearsOfExperience: typeof s === "object" && s !== null ? s.yearsOfExperience ?? undefined : undefined,
            }
          }));
        }

        // soft skills
        if (task.softSkills && Array.isArray(task.softSkills)) {
          setSoftSkills(task.softSkills.map((s: { name?: string } | string) => (typeof s === "string" ? s : s.name || "")));
        }
      } catch (err) {
        console.error("Failed to fetch task", err);
        setFetchError("Görev bilgileri yüklenemedi.");
      } finally {
        setIsFetching(false);
      }
    };

    if (taskId) fetchTask();
  }, [taskId, setValue]);

  // ─── Hard skill handlers ───────────────────────────────────────────────────
  const handleAddHardSkill = () => {
    if (hardSkillInput.trim() && !hardSkills.some(h => h.skill === hardSkillInput.trim())) {
      setHardSkills([...hardSkills, {
        skill: hardSkillInput.trim(),
        level: hardSkillLevel,
        isRequired: hardSkillIsRequired,
        yearsOfExperience: hardSkillYears !== "" ? Number(hardSkillYears) : undefined,
      }]);
      setHardSkillInput("");
      setHardSkillLevel(5);
      setHardSkillIsRequired(true);
      setHardSkillYears("");
    }
  };
  const handleRemoveHardSkill = (skill: string) => setHardSkills(hardSkills.filter(h => h.skill !== skill));

  // ─── Soft skill handlers ───────────────────────────────────────────────────
  const handleAddSoftSkill = () => {
    if (softSkillInput.trim() && !softSkills.includes(softSkillInput.trim())) {
      setSoftSkills([...softSkills, softSkillInput.trim()]);
      setSoftSkillInput("");
    }
  };
  const handleRemoveSoftSkill = (skill: string) => setSoftSkills(softSkills.filter(s => s !== skill));

  // ─── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (data: EditTaskFormData) => {
    setIsLoading(true);
    try {
      // Clean up fields based on reward type to pass backend validation
      const cleanedData: Partial<EditTaskFormData> = { ...data };
      if (cleanedData.reward_type !== "money") {
        delete cleanedData.budget;
        delete cleanedData.currency;
      }
      if (cleanedData.reward_type !== "internship") {
        delete cleanedData.internship_duration;
        delete cleanedData.internship_department;
        delete cleanedData.internship_is_paid;
      }
      if (cleanedData.reward_type !== "certificate") {
        delete cleanedData.certificate_name;
        delete cleanedData.certificate_issuer;
      }

      // Remove any empty string values that are supposed to be ENUMs
      (["currency", "internship_is_paid", "experience_level", "preferred_major", "work_type"] as const).forEach((key) => {
          if (cleanedData[key] === "") {
             delete cleanedData[key];
          }
      });

      const payload = {
        ...cleanedData,
        hardSkills,
        softSkills,
        requiredSkills: hardSkills.map(h => h.skill),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      };
      await taskService.updateTask(taskId, payload);
      router.push(`/company/tasks/${taskId}`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      console.error("Task update error:", error);
      setFetchError(error?.response?.data?.message || error?.message || "Görev güncellenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Görev yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">{fetchError}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto">
      <Breadcrumb
        items={[
          { label: "Görevler", href: "/company/tasks" },
          { label: "Görevi Düzenle" },
        ]}
      />

      <FormCard
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-full"
        actions={
          <div className="flex justify-end gap-3 w-full">
            <FormButton type="button" variant="outline" onClick={() => router.back()}>
              Vazgeç
            </FormButton>
            <FormButton type="submit" isLoading={isLoading}>
              {isLoading ? "Güncelleniyor..." : "Güncelle"}
            </FormButton>
          </div>
        }
      >
        {/* ── Category & Subcategory ─────────────────────────────────────── */}
        <FormSection title="Görev Durumu & Kategori">
          <FormRow cols={3}>
            <FormSelect
              label="Görev Durumu"
              name="status"
              options={[
                { value: "open", label: "Başvurulara Açık" },
                { value: "review", label: "İnceleniyor" },
                { value: "in_progress", label: "Devam Ediyor" },
                { value: "closed", label: "Tamamlandı / Kapalı" },
              ]}
              value={watch("status") || "open"}
              onChange={(val) => setValue("status", val as any)}
              required
            />
            <FormSelect
              label="Kategori"
              name="category"
              options={TASK_CATEGORIES}
              value={watch("category") || ""}
              onChange={(val) => {
                setValue("category", val, { shouldValidate: true });
                setValue("subcategory", "");
              }}
              error={errors.category?.message}
              required
            />
            <FormSelect
              label="Alt Kategori"
              name="subcategory"
              options={availableSubcategories}
              value={watch("subcategory") || ""}
              onChange={(val) => setValue("subcategory", val, { shouldValidate: true })}
              disabled={!selectedCategory}
              placeholder={selectedCategory ? "Seçiniz" : "Önce kategori seçiniz"}
              error={errors.subcategory?.message}
              required
            />
          </FormRow>
        </FormSection>

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <FormInput
          label="Görev Başlığı"
          {...register("title")}
          error={errors.title?.message}
          hint="Adayların ilgisini çekecek net ve anlaşılır bir başlık giriniz."
          placeholder="Örn: React Frontend Developer Stajyeri"
          required
        />

        {/* ── Description ───────────────────────────────────────────────── */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              label="Açıklama"
              value={field.value || ""}
              onChange={(val) => {
                if (val === "<p><br></p>") field.onChange("");
                else field.onChange(val);
              }}
              error={errors.description?.message}
              placeholder="Görev detaylarını, beklentileri ve sorumlulukları yazınız..."
              required
            />
          )}
        />

        {/* ── Hard Skills ───────────────────────────────────────────────── */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Teknik Yetenekler (Hard Skills)</label>
          {/* Row 1: skill input + level ring + add */}
          <div className="flex gap-2 mb-2">
            <div className="relative grow">
              <input
                type="text"
                value={hardSkillInput}
                onChange={(e) => setHardSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddHardSkill())}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100/80 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all hover:border-gray-300"
                placeholder="Yetenek ekle (örn: React, Python)"
              />
            </div>
            {/* Circular level ring */}
            {(() => {
              const r = 16;
              const circ = 2 * Math.PI * r;
              const progress = (hardSkillLevel / 10) * circ;
              const levelColor = hardSkillLevel <= 2 ? "#ef4444" : hardSkillLevel <= 4 ? "#fb923c" : hardSkillLevel <= 6 ? "#facc15" : hardSkillLevel <= 8 ? "#84cc16" : "#22c55e";
              return (
                <div className="flex items-center gap-1 px-3 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 transition-all bg-white self-stretch">
                  <button type="button" onClick={() => setHardSkillLevel(Math.max(1, hardSkillLevel - 1))} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 bg-white text-gray-500 hover:text-gray-800 transition-all text-sm font-bold shadow-sm">−</button>
                  <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
                    <svg width="48" height="48" viewBox="0 0 44 44" className="-rotate-90">
                      <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="22" cy="22" r={r} fill="none" stroke={levelColor} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress} ${circ}`} style={{ transition: "stroke-dasharray 0.25s ease, stroke 0.25s ease" }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-gray-700 tracking-tight leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {hardSkillLevel}<span className="text-[8px] font-normal text-gray-400">/10</span>
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setHardSkillLevel(Math.min(10, hardSkillLevel + 1))} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 bg-white text-gray-500 hover:text-gray-800 transition-all text-sm font-bold shadow-sm">+</button>
                </div>
              );
            })()}
            <button type="button" onClick={handleAddHardSkill} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
              <FiPlus size={20} />
            </button>
          </div>
          {/* Row 2: Required toggle + Years */}
          <div className="flex items-center gap-3 mb-3 pl-1">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
              <button type="button" onClick={() => setHardSkillIsRequired(true)}
                className={`px-3 py-1.5 transition-colors ${hardSkillIsRequired ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                Zorunlu
              </button>
              <button type="button" onClick={() => setHardSkillIsRequired(false)}
                className={`px-3 py-1.5 border-l border-gray-200 transition-colors ${!hardSkillIsRequired ? "bg-blue-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                Tercih Edilen
              </button>
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
              <span className="text-xs text-gray-500 whitespace-nowrap">Deneyim (yıl)</span>
              <input
                type="number"
                min={0}
                max={20}
                value={hardSkillYears}
                onChange={(e) => setHardSkillYears(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-12 text-xs text-center border-none outline-none bg-transparent text-gray-700 font-semibold"
                placeholder="-"
              />
            </div>
          </div>
          {hardSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100 border-dashed min-h-[60px]">
              {hardSkills.map((h) => (
                <span key={h.skill} className="bg-white border text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
                  style={{ borderColor: h.isRequired ? "#fca5a5" : "#93c5fd", color: h.isRequired ? "#dc2626" : "#2563eb" }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: h.isRequired ? "#ef4444" : "#3b82f6" }} title={h.isRequired ? "Zorunlu" : "Tercih Edilen"} />
                  <span className="text-gray-800 font-medium">{h.skill}</span>
                  {(() => {
                    const filled = Math.round(h.level / 10 * 5);
                    const color = h.level <= 2 ? "#ef4444" : h.level <= 4 ? "#fb923c" : h.level <= 6 ? "#facc15" : h.level <= 8 ? "#84cc16" : "#22c55e";
                    return (
                      <span className="flex items-end gap-0.5" title={`Seviye: ${h.level}/10`}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} style={{ width: 3, height: 4 + i * 2, borderRadius: 2, backgroundColor: i <= filled ? color : "#e5e7eb", display: "inline-block", transition: "background-color 0.2s" }} />
                        ))}
                      </span>
                    );
                  })()}
                  {h.yearsOfExperience !== undefined && h.yearsOfExperience > 0 && (
                    <span className="text-[10px] text-gray-400 font-normal">{h.yearsOfExperience}y</span>
                  )}
                  <button type="button" onClick={() => handleRemoveHardSkill(h.skill)} className="hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors ml-0.5"><FiX size={13} /></button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic p-2">Henüz teknik yetenek eklenmedi.</div>
          )}
        </div>

        {/* ── Soft Skills ───────────────────────────────────────────────── */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Soft Skills (Opsiyonel)</label>
          <div className="flex gap-2 mb-3">
            <div className="relative grow">
              <input
                type="text"
                value={softSkillInput}
                onChange={(e) => setSoftSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSoftSkill())}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100/80 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all hover:border-gray-300"
                placeholder="Soft skill ekle (örn: Takım Çalışması)"
              />
            </div>
            <button type="button" onClick={handleAddSoftSkill} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm active:scale-95"><FiPlus size={20} /></button>
          </div>
          {softSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100 border-dashed min-h-10">
              {softSkills.map((s) => (
                <span key={s} className="bg-white border border-primary/20 text-primary px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm transition-all hover:shadow-md hover:border-primary/40">
                  {s}
                  <button type="button" onClick={() => handleRemoveSoftSkill(s)} className="hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"><FiX size={14} /></button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic p-2">Henüz soft skill eklenmedi.</div>
          )}
        </div>

        {/* ── Task Details ──────────────────────────────────────────────── */}
        <FormSection title="Görev Detayları">
          <FormRow cols={2}>
            <FormSelect
              label="Ödül Türü"
              name="reward_type"
              options={[
                { value: "money", label: "Para Ödülü" },
                { value: "internship", label: "Staj İmkanı" },
                { value: "certificate", label: "Sertifika" },
                { value: "recommendation", label: "Tavsiye Mektubu" },
                { value: "mentorship", label: "Mentorluk" },
              ]}
              value={watchedRewardType || ""}
              onChange={(val) => {
                setValue("reward_type", val);
                setValue("budget", "");
                setValue("currency", "");
                setValue("internship_duration", "");
                setValue("internship_department", "");
                setValue("internship_is_paid", "");
                setValue("certificate_name", "");
                setValue("certificate_issuer", "");
              }}
            />

            {watchedRewardType === "money" && (
              <>
                <FormInput label="Ödül Miktarı" type="number" min={0} step={1} {...register("budget")} icon={FiDollarSign} placeholder="Miktar giriniz" required />
                <FormSelect
                  label="Para Birimi"
                  name="currency"
                  options={[
                    { value: "TRY", label: "₺ Türk Lirası" },
                    { value: "USD", label: "$ Amerikan Doları" },
                    { value: "EUR", label: "€ Euro" },
                  ]}
                  value={watch("currency") || ""}
                  onChange={(val) => setValue("currency", val)}
                  placeholder="Para birimi seçiniz"
                />
              </>
            )}

            {watchedRewardType === "internship" && (
              <>
                <FormInput label="Staj Süresi" {...register("internship_duration")} placeholder="Örn: 3 ay, 1 yıl" icon={FiCalendar} required />
                <FormInput label="Staj Departmanı" {...register("internship_department")} placeholder="Örn: Yazılım Geliştirme" />
                <FormSelect
                  label="Ücretli mi?"
                  name="internship_is_paid"
                  options={[
                    { value: "paid", label: "Ücretli" },
                    { value: "unpaid", label: "Ücretsiz" },
                  ]}
                  value={watch("internship_is_paid") || ""}
                  onChange={(val) => setValue("internship_is_paid", val)}
                  placeholder="Seçiniz"
                />
              </>
            )}

            {watchedRewardType === "certificate" && (
              <>
                <FormInput label="Sertifika Adı" {...register("certificate_name")} placeholder="Örn: Frontend Geliştirici Sertifikası" required />
                <FormInput label="Veren Kurum" {...register("certificate_issuer")} placeholder="Örn: Şirket adı veya platform" />
              </>
            )}

            {watchedRewardType === "recommendation" && (
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-800 space-y-1">
                <p className="font-semibold">Tavsiye Mektubu</p>
                <p className="text-blue-600">Görevi başarıyla tamamlayan adaya şirket yetkilisi tarafından kişisel tavsiye mektubu yazılacaktır.</p>
              </div>
            )}

            {watchedRewardType === "mentorship" && (
              <div className="md:col-span-2 bg-purple-50 border border-purple-200 rounded-xl px-5 py-4 text-sm text-purple-800 space-y-1">
                <p className="font-semibold">Mentorluk Programı</p>
                <p className="text-purple-600">Görevi başarıyla tamamlayan aday, şirketin deneyimli uzmanlarından bire bir mentorluk desteği alacaktır.</p>
              </div>
            )}

            <FormInput label="Pozisyon Sayısı" type="number" min={1} {...register("positions", { valueAsNumber: true })} error={errors.positions?.message} placeholder="Kaç kişi alınacak?" required />

            <FormSelect
              label="Deneyim Seviyesi"
              name="experience_level"
              options={[
                { value: "beginner", label: "Başlangıç" },
                { value: "intermediate", label: "Orta" },
                { value: "advanced", label: "İleri" },
              ]}
              value={watch("experience_level") || ""}
              onChange={(val) => setValue("experience_level", val, { shouldValidate: true })}
              error={errors.experience_level?.message}
              required
            />

            <FormInput label="Tercih Edilen Bölüm (Opsiyonel)" {...register("preferred_major")} placeholder="Örn: Bilgisayar Mühendisliği" />

            <FormSelect
              label="Çalışma Tipi"
              name="work_type"
              options={[
                { value: "remote", label: "Uzaktan" },
                { value: "hybrid", label: "Hibrit" },
                { value: "onsite", label: "Ofiste" },
              ]}
              value={watch("work_type") || ""}
              onChange={(val) => setValue("work_type", val, { shouldValidate: true })}
              error={errors.work_type?.message}
              required
            />

            <FormInput label="Son Başvuru Tarihi" type="date" {...register("deadline")} icon={FiCalendar} />
          </FormRow>
        </FormSection>
      </FormCard>
    </div>
  );
}
