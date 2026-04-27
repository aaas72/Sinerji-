"use client";

import { useState } from "react";
import MainSection from "@/components/ui/layouts/MainSection";
import Button from "@/components/ui/Button";
import {
  FiLock,
  FiBell,
  FiShield,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiLogOut,
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { authService } from "@/services/auth.service";

/* ─── küçük yardımcı bileşenler ─── */

function SettingCard({
  icon: Icon,
  title,
  description,
  accent = false,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <MainSection
      hideHeader
      className={accent ? "border-red-200 bg-red-50/40" : ""}
    >
      <div className="flex gap-4">
        <div
          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            accent
              ? "bg-red-100 text-red-500"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold mb-0.5 ${
              accent ? "text-red-700" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm mb-5 ${
              accent ? "text-red-400" : "text-gray-500"
            }`}
          >
            {description}
          </p>
          {children}
        </div>
      </div>
    </MainSection>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

/* ─── ana sayfa ─── */

const inputCls =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all";

export default function CompanySettingsPage() {
  const { showToast } = useToast();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  /* şifre formu */
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const pwField = (k: keyof typeof pw) => ({
    value: pw[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setPw((p) => ({ ...p, [k]: e.target.value })),
  });

  /* bildirim tercihleri */
  const [notifs, setNotifs] = useState({
    newApplication: true,
    taskUpdate: true,
    systemAnnouncement: false,
    weeklyReport: false,
  });
  const toggle = (k: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [k]: !n[k] }));

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

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="space-y-4">
      {/* başlık */}
      <Breadcrumb
        items={[
          { label: "Ana Sayfa", href: "/company" },
          { label: "Ayarlar", active: true },
        ]}
      />

      {/* ① Hesap Bilgileri */}
      <SettingCard
        icon={FiShield}
        title="Hesap Bilgileri"
        description="Hesabınıza ait temel bilgiler."
      >
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">E-posta</span>
            <span className="text-sm font-medium text-gray-800">
              {user?.email ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm text-gray-500">Hesap Türü</span>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              Şirket
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          E-posta adresinizi değiştirmek için destek ekibiyle iletişime geçin.
        </p>
      </SettingCard>

      {/* ② Şifre Değiştir */}
      <SettingCard
        icon={FiLock}
        title="Şifre Değiştir"
        description="Hesabınızı güvende tutmak için şifrenizi düzenli olarak güncelleyin."
      >
        <form
          onSubmit={handlePasswordChange}
          className="space-y-4 max-w-md"
        >
          {/* mevcut şifre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mevcut Şifre
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                {...pwField("current")}
                className={inputCls + " pr-10"}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* yeni şifre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Şifre
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                {...pwField("next")}
                className={inputCls + " pr-10"}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* tekrar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              {...pwField("confirm")}
              className={inputCls}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={pwLoading}
            className="mt-2"
          >
            {pwLoading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
          </Button>
        </form>
      </SettingCard>

      {/* ③ Bildirim Tercihleri */}
      <SettingCard
        icon={FiBell}
        title="Bildirim Tercihleri"
        description="Hangi bildirimleri almak istediğinizi seçin."
      >
        <div className="max-w-md">
          <Toggle
            checked={notifs.newApplication}
            onChange={() => toggle("newApplication")}
            label="Yeni başvuru geldiğinde bildir"
          />
          <Toggle
            checked={notifs.taskUpdate}
            onChange={() => toggle("taskUpdate")}
            label="Görev durumu güncellendiğinde bildir"
          />
          <Toggle
            checked={notifs.systemAnnouncement}
            onChange={() => toggle("systemAnnouncement")}
            label="Sistem duyurularını al"
          />
          <Toggle
            checked={notifs.weeklyReport}
            onChange={() => toggle("weeklyReport")}
            label="Haftalık özet raporu e-posta ile al"
          />
        </div>
      </SettingCard>

      {/* ④ Oturum */}
      <SettingCard
        icon={FiLogOut}
        title="Oturum"
        description="Aktif oturumunuzu yönetin."
      >
        <Button
          variant="outline"
          icon={FiLogOut}
          onClick={handleLogout}
          className="text-gray-700 border-gray-200 hover:bg-gray-100!"
        >
          Çıkış Yap
        </Button>
      </SettingCard>

      {/* ⑤ Tehlike Bölgesi */}
      <SettingCard
        icon={FiAlertTriangle}
        title="Tehlike Bölgesi"
        description="Bu işlemler geri alınamaz. Lütfen dikkatli olun."
        accent
      >
        <Button
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50! text-sm"
          onClick={() =>
            showToast("Hesap silme özelliği yakında kullanılabilir olacaktır.", "error")
          }
        >
          Hesabı Sil
        </Button>
      </SettingCard>
    </div>
  );
}
