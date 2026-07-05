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
  FiMessageSquare,
} from "react-icons/fi";
import PrimaryButton from "@/components/ui/PrimaryButton";
import NotificationBell from "@/components/ui/NotificationBell";
import MessageIndicator from "@/components/ui/MessageIndicator";
import { useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import { useAuthStore } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";

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
    href: "/student/settings",
    label: "Ayarlar",
    icon: FiSettings,
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
  { href: "/student", label: "Görevler" },
  { href: "/student/saved-tasks", label: "Mahfuzat" },
  { href: "/student/applications", label: "Başvurularım" },
  { href: "/student/explore", label: "Keşfet" },
];

const companyNavbarLinks = [
  { href: "/company/dashboard", label: "Özet" },
  { href: "/company/tasks", label: "Görevlerim" },
  { href: "/company/applications", label: "Başvurular" },
  { href: "/company/explore", label: "Keşfet" },
];

type NavbarProps = {
  authenticated: boolean;
  userName?: string;
  role?: "student" | "company" | "guest";
};

export default function Navbar({ authenticated, userName, role }: NavbarProps) {

  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const { openLogin, openRegister } = useAuthModal();
  const { showLoader, hideLoader } = useGlobalLoader();
  const pathname = usePathname();

  const isAuth = isAuthenticated && !!user;
  const name =
    userName ||
    user?.studentProfile?.full_name ||
    user?.companyProfile?.company_name ||
    "User";

  const imageUrl =
    user?.studentProfile?.profile_image_url ||
    user?.companyProfile?.logo_url;

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
    showLoader("Çıkış yapılıyor...");
    setTimeout(() => {
      logout();
      router.replace("/");
      hideLoader();
    }, 1500);
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY.current && currentScrollY > 50) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  // Don't render inconsistent state during hydration
  if (!_hasHydrated) {
    return (
      <header className="w-full z-50 absolute top-0 left-0 right-0 bg-transparent">
        <nav className="max-w-[1280px] mx-auto px-6 md:px-16 py-4 flex items-center justify-between">
          <span className="text-[#004d40] font-bold text-lg tracking-tight">
            Sinerji
          </span>
        </nav>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "w-full z-50 transition-transform duration-300 transform",
        isLanding
          ? "absolute top-0 left-0 right-0 bg-transparent"
          : "bg-white/85 backdrop-blur-md border-b border-[#dfded6]/30 shadow-sm shadow-[#00342b]/5 sticky top-0",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <nav className="max-w-[1280px] mx-auto px-6 md:px-16 h-[64px] flex items-center justify-between">
        {/* Left: Brand logo & Navigation links */}
        <div className="flex items-center gap-8 lg:gap-12 h-full">
          <Link
            href={homeLink}
            className={cn(
              "font-bold text-lg tracking-tight transition-opacity hover:opacity-90",
              isLanding ? "text-white" : "text-[#004d40]"
            )}
          >
            Sinerji
          </Link>
          
          {isAuth && (
            <div className="hidden md:flex items-center gap-0 h-full">
              {navbarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-[14px] transition-all h-full flex items-center justify-center border-b-2 w-[90px]",
                      isActive
                        ? "text-[#004d40] font-bold border-[#004d40]"
                        : "text-gray-500 hover:text-gray-900 font-medium border-transparent"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {!isAuth ? (
            <div className="flex items-center gap-3">
              {isLanding ? (
                <>
                  <button
                    onClick={openLogin}
                    className="text-white/70 hover:text-white hover:bg-white/10 font-medium text-xs px-3.5 py-1.5 rounded-full border border-white/20 transition-all"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={openRegister}
                    className="text-white bg-white/15 hover:bg-white/25 font-bold text-xs px-4 py-1.5 rounded-full border border-white/10 transition-all"
                  >
                    Kayıt Ol
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    className="text-gray-600 hover:text-gray-950 font-bold text-xs px-4 py-2 transition-all"
                  >
                    Giriş Yap
                  </button>
                  <PrimaryButton
                    variant="primary"
                    className="bg-[#004d40] hover:bg-[#003d33] text-white px-5 py-2 rounded-full font-bold text-xs shadow-xs"
                    onClick={openRegister}
                  >
                    Kayıt Ol
                  </PrimaryButton>
                </>
              )}
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <NotificationBell />

                {/* Messages */}
                <MessageIndicator />

                {/* Profile Circle Menu */}
                <div
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-100 transition-all cursor-pointer select-none overflow-hidden"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name}
                      className="w-full h-full object-cover animate-fadeIn"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-[9px] font-bold text-[#004d40]">
                      {name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {menuOpen && (
                <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-xl shadow-lg border border-[#f1f0ea] py-1.5 z-50 animate-slideUp">
                  <div className="px-4 py-3 border-b border-gray-100/60">
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  {menuItems.map((item, index) => (
                    <div key={index}>
                      {item.isLogout ? (
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors mt-1"
                        >
                          <item.icon size={14} />
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          href={item.href === "/student/profile" ? `/students/${user?.id}` : item.href === "/company/profile" ? `/companies/${user?.id}` : item.href}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <item.icon size={14} />
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
