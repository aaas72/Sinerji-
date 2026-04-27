"use client";
import Link from "next/link";
import {
  FiBell,
  FiMoreVertical,
  FiGrid,
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiBriefcase,
  FiBookmark,
  FiPlusSquare,
  FiList,
} from "react-icons/fi";
import Button from "@/components/ui/Button";
import { useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import { useAuthStore } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

type MenuItem = {
  href: string;
  label: string;
  icon: IconType;
  isLogout?: boolean;
};

const studentMenuItems: MenuItem[] = [
  {
    href: "/student/profile",
    label: "Profil",
    icon: FiUser,
  },
  {
    href: "#",
    label: "Çıkış Yap",
    icon: FiLogOut,
    isLogout: true,
  },
];

const companyMenuItems: MenuItem[] = [
  {
    href: "/company/tasks/new",
    label: "Yeni Görev Ekle",
    icon: FiPlusSquare,
  },
  {
    href: "/company/settings",
    label: "Şirket Ayarları",
    icon: FiSettings,
  },
  {
    href: "/help",
    label: "Yardım",
    icon: FiHelpCircle,
  },
  {
    href: "#",
    label: "Çıkış Yap",
    icon: FiLogOut,
    isLogout: true,
  },
];

const studentNavbarLinks = [
  { href: "/student", label: "Görevleri İncele" },
  { href: "/student/saved-tasks", label: "Mahfuzat" },
  { href: "/student/applications", label: "Başvurularım" },
];

const companyNavbarLinks = [
  { href: "/company/dashboard", label: "Kontrol Paneli" },
  { href: "/company/tasks", label: "Görevlerim" },
];

type NavbarProps = {
  authenticated: boolean;
  userName?: string;
  role?: "student" | "company" | "guest";
};

export default function Navbar({ authenticated, userName, role }: NavbarProps) {

  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const { openLogin, openRegister } = useAuthModal();
  const pathname = usePathname();

  const isAuth = isAuthenticated && !!user;
  const name =
    userName || (user && (typeof user === "object" && "full_name" in user ? (user.full_name as string) : undefined))
    || (user && (typeof user === "object" && "company_name" in user ? (user.company_name as string) : undefined))
    || "User";

  const userRole = (role || user?.role || "guest").toLowerCase();
  const menuItems = userRole === "company" ? companyMenuItems : studentMenuItems;
  const navbarLinks =
    userRole === "company" ? companyNavbarLinks : studentNavbarLinks;

  const homeLink =
    userRole === "student"
      ? "/student"
      : userRole === "company"
      ? "/company/dashboard"
      : "/";


  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const isLanding = pathname === "/" && !isAuth;

  // Don't render inconsistent state during hydration
  if (!_hasHydrated) {
    // أثناء التحميل، استخدم نفس مظهر صفحة الهبوط
    return (
      <header className={cn(
        "w-full z-50 absolute top-0 left-0 right-0 bg-transparent"
      )}>
        <nav className="mx-auto max-w-6xl px-4 py-3 grid grid-cols-3 items-center gap-4">
          <div className="flex justify-start">
            <span className="text-white font-heading text-xl font-bold tracking-wider">
              SİNERJİ
            </span>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "w-full z-50",
        isLanding
          ? "absolute top-0 left-0 right-0 bg-transparent"
          : "bg-white border-b border-gray-300"
      )}
    >
      <nav className="mx-auto max-w-6xl px-4 py-3 grid grid-cols-3 items-center gap-4">
        <div className="flex justify-start">
          <Link
            href={homeLink}
            className={cn(
              "font-heading text-xl font-bold tracking-wider",
              isLanding ? "text-white" : "text-primary"
            )}
          >
            SİNERJİ
          </Link>
        </div>

        <div className="flex justify-center gap-8">
          {isAuth &&
            navbarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 transition-colors font-medium",
                  pathname === link.href
                    ? "text-[#004d40]"
                    : "text-gray-400 hover:text-[#004d40]"
                )}
              >
                <span>{link.label}</span>
              </Link>
            ))}
        </div>

        <div className="flex justify-end">
          {!isAuth ? (
            <div className="flex items-center gap-3">
              {isLanding ? (
                <>
                  <button
                    onClick={openLogin}
                    className="text-white/70 hover:text-white hover:bg-white/10 font-medium text-sm px-3 py-1.5 rounded-md border border-white/20 transition-all"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={openRegister}
                    className="text-white/70 hover:text-white hover:bg-white/10 font-medium text-sm px-3 py-1.5 rounded-md border border-white/20 transition-all"
                  >
                    Kayıt Ol
                  </button>
                </>
              ) : (
                <>
                  <Button variant="primary" onClick={openLogin}>Giriş Yap</Button>
                  <Button
                    variant="default"
                    className="border border-primary bg-transparent"
                    onClick={openRegister}
                  >
                    Kayıt Ol
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <div className="flex items-center gap-4">
                <button className="text-[#004d40] hover:text-[#004d40] transition-colors">
                  <FiBell size={20} className="text-[#004d40]" />
                </button>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  {menuItems.map((item, index) => (
                    <div key={index}>
                      {item.isLogout ? (
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <item.icon size={16} />
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <item.icon size={16} />
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
