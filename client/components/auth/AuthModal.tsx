"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, LoginFormData, RegisterFormData, User } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import Button from "@/components/ui/Button";
import {
  FiX,
  FiCheckCircle,
  FiBriefcase,
  FiAward,
  FiTrendingUp,
  FiStar,
} from "react-icons/fi";

export default function AuthModal() {
  const router = useRouter();
  const { isOpen, view, close, switchView } = useAuthModal();
  const loginAction = useAuthStore((state) => state.login);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) close();
  };

  const handleSuccess = (user: User) => {
    loginAction(user);
    close();
    if (user.role === "student") router.push("/student");
    else router.push("/company/dashboard");
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp flex max-h-[90vh]">
        {/* ─── Left Panel ─── */}
        <div className="hidden lg:flex lg:w-[45%] bg-linear-to-br from-[#004d40] to-[#00695c] text-white p-10 flex-col justify-center relative overflow-hidden shrink-0">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbb049]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold font-heading mb-3">
              {view === "login"
                ? "Tekrar Hoş Geldiniz!"
                : "Başarı Burada Başlar"}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8">
              {view === "login"
                ? "Hesabınıza giriş yapın ve fırsatlarınızı keşfedin."
                : "Hesap oluşturun ve yeteneğinizi dünyaya kanıtlayın."}
            </p>

            <div className="space-y-4">
              {[
                { icon: FiBriefcase, text: "Gerçek dünya projeleri" },
                { icon: FiAward, text: "Onaylı rozetler ve sertifikalar" },
                { icon: FiTrendingUp, text: "Kariyer gelişimi fırsatları" },
                { icon: FiStar, text: "Sektör profesyonellerinden destek" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-[#fbb049]" />
                  </div>
                  <span className="text-sm text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right Panel (Form) ─── */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors z-10"
          >
            <FiX size={18} />
          </button>

          <div className="p-8 lg:p-10">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 font-heading">
                {view === "login" ? "Giriş Yap" : "Yeni Hesap Oluştur"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {view === "login" ? (
                  <>
                    Hesabınız yok mu?{" "}
                    <button
                      onClick={() => switchView("register")}
                      className="text-[#004d40] font-semibold hover:underline"
                    >
                      Kayıt Ol
                    </button>
                  </>
                ) : (
                  <>
                    Zaten hesabınız var mı?{" "}
                    <button
                      onClick={() => switchView("login")}
                      className="text-[#004d40] font-semibold hover:underline"
                    >
                      Giriş Yap
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                E-posta ile devam et
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Form */}
            {view === "login" ? (
              <LoginForm onSuccess={handleSuccess} />
            ) : (
              <RegisterForm onSuccess={handleSuccess} />
            )}

            {/* Terms */}
            <p className="text-[11px] text-gray-400 mt-6 leading-relaxed text-center">
              Devam ederek{" "}
              <span className="text-[#004d40] cursor-pointer hover:underline">
                Kullanım Şartları
              </span>
              &apos;nı kabul etmiş olursunuz. Kişisel verileriniz hakkında bilgi
              almak için{" "}
              <span className="text-[#004d40] cursor-pointer hover:underline">
                Gizlilik Politikası
              </span>
              &apos;mızı okuyun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Login Form ─── */
function LoginForm({
  onSuccess,
}: {
  onSuccess: (user: User) => void;
}) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const { user } = await authService.login(data);
      onSuccess(user);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Giriş başarısız. Lütfen tekrar deneyin.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <FiX size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          E-posta
        </label>
        <input
          type="email"
          {...register("email")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-gray-50/50 transition-all text-sm"
          placeholder="ornek@email.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Şifre
        </label>
        <input
          type="password"
          {...register("password")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-gray-50/50 transition-all text-sm"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-[#004d40] hover:bg-[#003830] text-white py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#004d40]/20 mt-2"
        disabled={isLoading}
      >
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}

/* ─── Register Form ─── */
function RegisterForm({
  onSuccess,
}: {
  onSuccess: (user: User) => void;
}) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"student" | "company">("student");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "student" },
  });

  const handleRoleChange = (newRole: "student" | "company") => {
    setRole(newRole);
    setValue("role", newRole);
    reset({ role: newRole });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const { user } = await authService.register(data);
      onSuccess(user);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Kayıt başarısız. Lütfen tekrar deneyin.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <FiX size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          type="button"
          onClick={() => handleRoleChange("student")}
          className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            role === "student"
              ? "bg-white text-[#004d40] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiCheckCircle
            size={14}
            className={`inline mr-1.5 ${
              role === "student" ? "text-[#004d40]" : "text-transparent"
            }`}
          />
          Öğrenci
        </button>
        <button
          type="button"
          onClick={() => handleRoleChange("company")}
          className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            role === "company"
              ? "bg-white text-[#004d40] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiCheckCircle
            size={14}
            className={`inline mr-1.5 ${
              role === "company" ? "text-[#004d40]" : "text-transparent"
            }`}
          />
          Şirket
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta</label>
        <input
          type="email"
          {...register("email")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-gray-50/50 transition-all text-sm"
          placeholder="ornek@email.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifre</label>
        <input
          type="password"
          {...register("password")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-gray-50/50 transition-all text-sm"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {role === "student" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Soyad</label>
            <input
              type="text"
              {...register("full_name")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-gray-50/50 transition-all text-sm"
              placeholder="Ahmet Yılmaz"
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Üniversite (Opsiyonel)</label>
            <input
              type="text"
              {...register("university")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-gray-50/50 transition-all text-sm"
              placeholder="Üniversite Adı"
            />
          </div>
        </>
      )}

      {role === "company" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Şirket Adı</label>
            <input
              type="text"
              {...register("company_name")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-gray-50/50 transition-all text-sm"
              placeholder="Tech Corp"
            />
            {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Web Sitesi (Opsiyonel)</label>
            <input
              type="url"
              {...register("website_url")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-gray-50/50 transition-all text-sm"
              placeholder="https://example.com"
            />
            {errors.website_url && <p className="text-red-500 text-xs mt-1">{errors.website_url.message}</p>}
          </div>
        </>
      )}

      <Button
        type="submit"
        className="w-full bg-[#004d40] hover:bg-[#003830] text-white py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#004d40]/20 mt-2"
        disabled={isLoading}
      >
        {isLoading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
      </Button>
    </form>
  );
}
