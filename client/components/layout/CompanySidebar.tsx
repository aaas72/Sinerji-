
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiList, FiSettings } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import { useAuthStore } from "@/hooks/useAuth";

import { FiBell, FiUser, FiHelpCircle } from "react-icons/fi";

const sidebarLinks = [
  { href: "/company/dashboard", label: "Kontrol Paneli", icon: <FiHome /> },
  { href: "/company/tasks", label: "Görevler", icon: <FiList /> },
  { href: "/company/notifications", label: "Bildirimler", icon: <FiBell /> },
  { href: "/company/profile", label: "Profilim", icon: <FiUser /> },
  { href: "/company/support", label: "Destek", icon: <FiHelpCircle /> },
  { href: "/company/settings", label: "Ayarlar", icon: <FiSettings /> },
];

const CompanySidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-linear-to-b from-[#00695c] via-[#00695c] to-[#004d40] border-r border-gray-100 py-4 px-4 fixed top-0 left-0 z-30">
      <div className="mb-10 text-left">
        <span className="text-xl font-bold text-white drop-shadow tracking-wider">SİNERJİ Şirket</span>
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-normal transition-colors
                ${isActive ? "bg-white/20 text-yellow-200 font-bold" : "text-white hover:bg-white/10 hover:text-yellow-100"}`}
              style={{ opacity: isActive ? 1 : 0.7 }}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-normal text-white/60 hover:bg-red-600 hover:text-white transition-colors mb-2"
        style={{ opacity: 0.8 }}
      >
        <FiLogOut className="text-base" />
        Çıkış Yap
      </button>
    </aside>
  );
};

export default CompanySidebar;

