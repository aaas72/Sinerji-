"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiBarChart2,
} from "react-icons/fi";
import { useAuthStore } from "@/hooks/useAuth";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Ana Sayfa", icon: <FiHome /> },
  { href: "/admin/users", label: "Kullanıcılar", icon: <FiUsers /> },
  { href: "/admin/content", label: "İçerik Yönetimi", icon: <FiFileText /> },
  { href: "/admin/statistics", label: "İstatistikler", icon: <FiBarChart2 /> },
  { href: "/admin/settings", label: "Ayarlar", icon: <FiSettings /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-linear-to-b from-[#1e293b] to-[#0f172a] py-4 px-4 fixed top-0 left-0 z-30">
      {/* Logo / Title */}
      <div className="mb-10 text-left px-2">
        <span className="text-xl font-bold text-white drop-shadow tracking-wider">
          SİNERJİ Admin
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-white/15 text-[#fbb049] font-semibold shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:bg-red-600/80 hover:text-white transition-all duration-200 mb-2"
      >
        <FiLogOut className="text-base" />
        Çıkış Yap
      </button>
    </aside>
  );
}
