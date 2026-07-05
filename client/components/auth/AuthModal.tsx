"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, LoginFormData, RegisterFormData, ForgotPasswordFormData, ResetPasswordFormData, User } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Input from "@/components/ui/Input";
import Tabs from "@/components/ui/Tabs";
import SynergyLoader from "@/components/ui/SynergyLoader";
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
  const pathname = usePathname();
  const { isOpen, view, close, switchView } = useAuthModal();
  const loginAction = useAuthStore((state) => state.login);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { showLoader, hideLoader } = useGlobalLoader();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      if (isOpen) {
        close();
        hideLoader();
      }
      prevPathname.current = pathname;
    }
  }, [pathname, isOpen, close, hideLoader]);

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
    showLoader("Başarılı!", "Yönlendiriliyor...");
    
    setTimeout(() => {
      const userRole = user.role.toLowerCase();
      const destination = userRole === "student" ? "/student" : "/company/dashboard";
      
      router.push(destination);
      router.refresh();
      // لا نغلق النافذة هنا، بل نتركها مفتوحة وتغلق تلقائياً عند تغير المسار
    }, 1500);
  };



  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
    >
      <div
        style={{ backgroundColor: "#faf9f6" }}
        className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-slideUp flex max-h-[90vh]"
      >
        {/* ─── Left Panel ─── */}
        <div className="hidden lg:flex lg:w-[45%] bg-linear-to-br from-[#004d40] to-[#00695c] text-white p-10 flex-col justify-center relative overflow-hidden shrink-0">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e28743]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold font-heading mb-3">
              {view === "login"
                ? "Tekrar Hoş Geldiniz!"
                : view === "forgot_password" || view === "reset_password"
                ? "Şifrenizi Kurtarın"
                : "Başarı Burada Başlar"}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8">
              {view === "login"
                ? "Hesabınıza giriş yapın ve fırsatlarınızı keşfedin."
                : view === "forgot_password" || view === "reset_password"
                ? "Şifrenizi unuttuysanız endişelenmeyin, size yardımcı olacağız."
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
                  <div className="flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-[#e28743]" />
                  </div>
                  <span className="text-sm text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right Panel (Form) ─── */}
        <div
          style={{ backgroundColor: "#faf9f6" }}
          className="flex-1 flex flex-col overflow-y-auto custom-scrollbar"
        >
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
                {view === "login" ? "Giriş Yap" : view === "forgot_password" ? "Şifremi Unuttum" : view === "reset_password" ? "Yeni Şifre Belirle" : "Yeni Hesap Oluştur"}
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
                ) : view === "forgot_password" || view === "reset_password" ? (
                  <>
                    Şifrenizi hatırladınız mı?{" "}
                    <button
                      onClick={() => switchView("login")}
                      className="text-[#004d40] font-semibold hover:underline"
                    >
                      Giriş Yap
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
            ) : view === "forgot_password" ? (
              <ForgotPasswordForm />
            ) : view === "reset_password" ? (
              <ResetPasswordForm />
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
  const { showLoader, hideLoader } = useGlobalLoader();
  const { switchView } = useAuthModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    showLoader("Giriş yapılıyor...");
    setError("");
    try {
      const [{ user }] = await Promise.all([
        authService.login(data),
        new Promise((resolve) => setTimeout(resolve, 3000))
      ]);
      onSuccess(user);
    } catch (err: unknown) {
      hideLoader();
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
        <Input
          type="email"
          {...register("email")}
          className="px-4 py-3 bg-white text-sm"
          placeholder="ornek@email.com"
          error={!!errors.email}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Şifre
        </label>
        <Input
          type="password"
          {...register("password")}
          className="px-4 py-3 bg-white text-sm"
          placeholder="••••••••"
          error={!!errors.password}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => switchView("forgot_password")}
          className="text-sm font-semibold text-[#004d40] hover:underline"
        >
          Şifremi Unuttum?
        </button>
      </div>

      <PrimaryButton
        type="submit"
        className="w-full bg-[#004d40] hover:bg-[#003830] text-white py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 mt-2"
        disabled={isLoading}
      >
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </PrimaryButton>
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
  const { showLoader, hideLoader } = useGlobalLoader();

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
    showLoader("Kayıt olunuyor...");
    setError("");
    try {
      const [{ user }] = await Promise.all([
        authService.register(data),
        new Promise((resolve) => setTimeout(resolve, 3000))
      ]);
      onSuccess(user);
    } catch (err: unknown) {
      hideLoader();
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
      <Tabs
        tabs={[
          { id: "student", label: "Öğrenci" },
          { id: "company", label: "Şirket" },
        ]}
        activeTab={role}
        onTabChange={(id) => handleRoleChange(id as "student" | "company")}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta</label>
        <Input
          type="email"
          {...register("email")}
          className="px-4 py-3 bg-white text-sm"
          placeholder="ornek@email.com"
          error={!!errors.email}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifre</label>
        <Input
          type="password"
          {...register("password")}
          className="px-4 py-3 bg-white text-sm"
          placeholder="••••••••"
          error={!!errors.password}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {role === "student" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Soyad</label>
            <Input
              type="text"
              {...register("full_name")}
              className="px-4 py-3 bg-white text-sm"
              placeholder="Ahmet Yılmaz"
              error={!!errors.full_name}
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Üniversite (Opsiyonel)</label>
            <Input
              type="text"
              {...register("university")}
              className="px-4 py-3 bg-white text-sm"
              placeholder="Üniversite Adı"
              error={!!errors.university}
            />
          </div>
        </>
      )}

      {role === "company" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Şirket Adı</label>
            <Input
              type="text"
              {...register("company_name")}
              className="px-4 py-3 bg-white text-sm"
              placeholder="Tech Corp"
              error={!!errors.company_name}
            />
            {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Web Sitesi (Opsiyonel)</label>
            <Input
              type="url"
              {...register("website_url")}
              className="px-4 py-3 bg-white text-sm"
              placeholder="https://example.com"
              error={!!errors.website_url}
            />
            {errors.website_url && <p className="text-red-500 text-xs mt-1">{errors.website_url.message}</p>}
          </div>
        </>
      )}

      <PrimaryButton
        type="submit"
        className="w-full bg-[#004d40] hover:bg-[#003830] text-white py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 mt-2"
        disabled={isLoading}
      >
      </PrimaryButton>
    </form>
  );
}

/* ─── Forgot Password Form ─── */
function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { switchView } = useAuthModal();
  const { showLoader, hideLoader } = useGlobalLoader();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    showLoader("Kod gönderiliyor...");
    setError("");
    try {
      await authService.forgotPassword(data.email);
      // Store email temporarily so reset form can use it if we wanted to, or let the user type it.
      // Usually, it's passed via state. For simplicity, we just switch view.
      localStorage.setItem("reset_email", data.email);
      hideLoader();
      switchView("reset_password");
    } catch (err: unknown) {
      hideLoader();
      setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
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
      <p className="text-sm text-gray-600 mb-4">
        E-posta adresinizi girin. Size şifrenizi sıfırlamanız için 6 haneli bir kod göndereceğiz.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          E-posta
        </label>
        <Input
          type="email"
          {...register("email")}
          className="px-4 py-3 bg-white text-sm"
          placeholder="ornek@email.com"
          error={!!errors.email}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <PrimaryButton
        type="submit"
        className="w-full bg-[#004d40] hover:bg-[#003830] text-white py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 mt-2"
        disabled={isLoading}
      >
        {isLoading ? "Gönderiliyor..." : "Kodu Gönder"}
      </PrimaryButton>
    </form>
  );
}

/* ─── Reset Password Form ─── */
function ResetPasswordForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { switchView } = useAuthModal();
  const { showLoader, hideLoader } = useGlobalLoader();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    showLoader("Şifreniz güncelleniyor...");
    setError("");
    try {
      const email = localStorage.getItem("reset_email") || "";
      if (!email) throw new Error("E-posta bulunamadı. Lütfen tekrar kod isteyin.");
      
      await authService.resetPassword({
        email,
        code: data.code,
        newPassword: data.newPassword,
      });
      localStorage.removeItem("reset_email");
      hideLoader();
      switchView("login");
    } catch (err: unknown) {
      hideLoader();
      setError(err instanceof Error ? err.message : "Şifre sıfırlanamadı.");
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
      <p className="text-sm text-gray-600 mb-4">
        E-postanıza gelen 6 haneli kodu ve yeni şifrenizi girin.
      </p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          6 Haneli Kod
        </label>
        <Input
          type="text"
          {...register("code")}
          className="px-4 py-3 bg-white text-sm"
          placeholder="123456"
          error={!!errors.code}
        />
        {errors.code && (
          <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Yeni Şifre
        </label>
        <Input
          type="password"
          {...register("newPassword")}
          className="px-4 py-3 bg-white text-sm"
          placeholder="••••••••"
          error={!!errors.newPassword}
        />
        {errors.newPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
        )}
      </div>

      <PrimaryButton
        type="submit"
        className="w-full bg-[#004d40] hover:bg-[#003830] text-white py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 mt-2"
        disabled={isLoading}
      >
        {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </PrimaryButton>
    </form>
  );
}
