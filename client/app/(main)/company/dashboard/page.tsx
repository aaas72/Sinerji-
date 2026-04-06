"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiBriefcase,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiArrowRight,
  FiCalendar,
  FiAlertCircle,
  FiTrendingUp,
} from "react-icons/fi";
import { companyService } from "@/services/company.service";
import { CompanyProfile } from "@/types/company";
import MainSection from "@/components/ui/layouts/MainSection";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";

interface DashboardStats {
  activeTasks: number;
  totalTasks: number;
  totalApplications: number;
  pendingApplications: number;
  hiredStudents: number;
  recentTasks: {
    id: number;
    title: string;
    status: string;
    created_at: string;
    _count: { submissions: number };
  }[];
  recentApplications: {
    id: number;
    status: string;
    submitted_at: string;
    task: { title: string };
    student: { full_name: string; user: { email: string } };
  }[];
}

/* ── küçük yardımcılar ── */

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-section border border-gray-200 rounded-xl p-5 flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
          accent
            ? "bg-[#fbb049]/20 text-[#b45309]"
            : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open:     { label: "Açık",      cls: "bg-green-100 text-green-700" },
    closed:   { label: "Kapalı",    cls: "bg-gray-100 text-gray-500" },
    pending:  { label: "Bekliyor",  cls: "bg-yellow-100 text-yellow-700" },
    accepted: { label: "Kabul",     cls: "bg-green-100 text-green-700" },
    rejected: { label: "Red",       cls: "bg-red-100 text-red-600" },
    hired:    { label: "İşe Alındı",cls: "bg-primary/10 text-primary" },
  };
  const cfg = map[status?.toLowerCase()] ?? { label: status, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── ana sayfa ── */

export default function CompanyDashboardPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([
          companyService.getMyProfile(),
          companyService.getMyStats(),
        ]);
        setProfile(p);
        setStats(s);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile || !stats) {
    return (
      <div className="flex flex-col items-center gap-3 min-h-[40vh] justify-center text-gray-500">
        <FiAlertCircle className="w-8 h-8 text-red-400" />
        <p>Veriler yüklenemedi. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.hiredStudents / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* ekmek kırıntısı */}
      <Breadcrumb
        items={[
          { label: "Ana Sayfa", href: "/company/dashboard" },
          { label: "Kontrol Paneli", active: true },
        ]}
      />

      {/* karşılama + hızlı eylem */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-500">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link href="/company/tasks/new">
          <Button variant="primary" icon={FiPlus}>
            Yeni Görev Oluştur
          </Button>
        </Link>
      </div>

      {/* KPI kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={FiBriefcase}   label="Aktif Görev"     value={stats.activeTasks}        sub={`${stats.totalTasks} toplam`} />
        <KpiCard icon={FiUsers}       label="Başvuru"          value={stats.totalApplications}  />
        <KpiCard icon={FiClock}       label="Bekleyen"         value={stats.pendingApplications} accent />
        <KpiCard icon={FiCheckCircle} label="İşe Alınan"       value={stats.hiredStudents}       />
        <KpiCard icon={FiTrendingUp}  label="Tamamlanma %"     value={completionRate}            sub="görev bazlı" />
      </div>

      {/* iki sütun içerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* sol: son başvurular */}
        <div className="lg:col-span-2">
          <MainSection
            title="Son Başvurular"
            description="En son gelen öğrenci başvuruları"
            headerExtra={
              <Link href="/company/tasks" className="text-xs text-primary hover:underline flex items-center gap-1">
                Tümünü Gör <FiArrowRight />
              </Link>
            }
          >
            {stats.recentApplications.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FiUsers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Henüz başvuru yok</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="py-3 flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {app.student.full_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {app.task.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(app.submitted_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </MainSection>
        </div>

        {/* sağ: son görevler */}
        <div className="lg:col-span-1">
          <MainSection
            title="Son Görevler"
            description="Oluşturduğunuz görevler"
            headerExtra={
              <Link href="/company/tasks" className="text-xs text-primary hover:underline flex items-center gap-1">
                Tümünü Gör <FiArrowRight />
              </Link>
            }
          >
            {stats.recentTasks.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FiBriefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Henüz görev yok</p>
                <Link
                  href="/company/tasks/new"
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  İlk görevi oluştur →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/company/tasks/${task.id}`}
                    className="block rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 p-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">
                        {task.title}
                      </p>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiUsers className="w-3 h-3" />
                        {task._count.submissions} başvuru
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(task.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </MainSection>
        </div>
      </div>
    </div>
  );
}
