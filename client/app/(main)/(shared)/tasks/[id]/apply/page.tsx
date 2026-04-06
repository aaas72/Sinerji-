"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormCard from "@/components/ui/form/FormCard";
import FormRow from "@/components/ui/form/FormRow";
import FormField from "@/components/ui/form/FormField";
import FormButton from "@/components/ui/form/FormButton";
import RichTextEditor from "@/components/ui/form/RichTextEditor";
import { taskService } from "@/services/task.service";
import { submissionService } from "@/services/submission.service";
import { Task } from "@/types/task";
import { useToast } from "@/context/ToastContext";

const applySchema = z.object({
  submission_content: z.string().min(50, "Lütfen en az 50 karakterlik bir başvuru yazısı girin."),
});

type ApplyValues = z.infer<typeof applySchema>;

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      submission_content: "",
    },
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (taskId) {
          const data = await taskService.getTaskById(taskId);
          setTask(data);
        }
      } catch (error) {
        showToast("Görev bilgileri alınamadı.", "error");
        router.push("/student/tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, router]);

  const onSubmit = async (data: ApplyValues) => {
    try {
      await submissionService.createSubmission(taskId, {
        submission_content: data.submission_content,
      });
      showToast("Başvurunuz başarıyla gönderildi!", "success");
      router.push("/student/tasks");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Başvuru sırasında bir hata oluştu.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Görev bulunamadı.
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto mt-12 pb-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Başvuru Yap: {task.title}</h1>
        <p className="text-gray-500">
          Bu göreve <strong>{task.company?.company_name}</strong> şirketinde başvuruyorsunuz. Neden bu görev için uygun olduğunuzu detaylıca anlatın.
        </p>
      </div>

      <FormCard
        title="Başvuru Bilgileri"
        subtitle="Lütfen başvuru mektubunuzu veya detaylarınızı aşağıya giriniz."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormRow>
            <FormField
              label="Başvuru Mektubu (Cover Letter)"
              error={errors.submission_content?.message}
              required
            >
              <Controller
                control={control}
                name="submission_content"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Örn: Bu görevle ilgileniyorum çünkü..."
                  />
                )}
              />
            </FormField>
          </FormRow>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <FormButton
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="mr-3"
            >
              İptal
            </FormButton>
            <FormButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Başvuruyu Gönder
            </FormButton>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
