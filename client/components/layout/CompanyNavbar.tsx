"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import {
  FiBell,
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiList,
  FiMessageSquare,
  FiShield,
} from "react-icons/fi";
import PrimaryButton from "@/components/ui/PrimaryButton";
import NotificationBell from "@/components/ui/NotificationBell";
import MessageIndicator from "@/components/ui/MessageIndicator";

const navLinks = [
  { href: "/company/dashboard", label: "Özet" },
  { href: "/company/tasks", label: "Görevlerim" },
  { href: "/company/applications", label: "Başvurular" },
  { href: "/company/explore", label: "Keşfet" },
];

export default function CompanyNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { user } = useAuthStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const prevScrollY = useRef(0);

  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive display name and letters
  const name =
    user?.studentProfile?.full_name ||
    user?.companyProfile?.company_name ||
    user?.email?.split("@")[0] ||
    "User";

  const imageUrl =
    user?.studentProfile?.profile_image_url ||
    user?.companyProfile?.logo_url;

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <header className={cn(
      "w-full z-50 bg-white/85 backdrop-blur-md border-b border-[#dfded6]/30 shadow-sm shadow-[#00342b]/5 sticky top-0 transition-transform duration-300 transform",
      visible ? "translate-y-0" : "-translate-y-full"
    )}>
      <nav className="max-w-[1280px] mx-auto px-6 md:px-16 h-[64px] flex items-center justify-between">
        
        {/* Left: Brand logo & Navigation links */}
        <div className="flex items-center gap-8 lg:gap-12 h-full">
          <Link
            href="/company/dashboard"
            className="font-bold text-lg tracking-tight transition-opacity hover:opacity-90 text-[#004d40]"
          >
            Sinerji
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-0 h-full">
            {navLinks.map((link) => {
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
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={menuRef}>
            <div className="flex items-center gap-4">
              
              {/* Notification Bell */}
              <NotificationBell />

              {/* Messages */}
              <MessageIndicator />

              {/* Profile Circle Menu */}
              <div
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-100 transition-all cursor-pointer select-none overflow-hidden"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
              </button>
            </div>

            {/* Dropdown Menu Panel (Desktop) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-xl shadow-lg border border-[#f1f0ea] py-1.5 z-50 animate-slideUp">
                <div className="px-4 py-3 border-b border-gray-100/60">
                  <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <Link
                    href={`/companies/${user?.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiUser size={14} />
                    Profilim
                  </Link>
                  <Link
                    href="/company/verify-guarantee"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiShield size={14} />
                    Belge Doğrula
                  </Link>
                  <Link
                    href="/company/settings"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiSettings size={14} />
                    Ayarlar
                  </Link>
                  <Link
                    href="/company/support"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiHelpCircle size={14} />
                    Destek
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <FiLogOut size={14} />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Mobile) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#f1f0ea] bg-white animate-slideUp">
          <nav className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-[13px] font-medium transition-all py-2.5 border-b border-gray-50/60 block",
                    isActive ? "text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/company/verify-guarantee"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[13px] font-medium transition-all py-2.5 border-b border-gray-50/60 block text-gray-500 hover:text-gray-900"
            >
              Belge Doğrula
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors mt-2"
            >
              <FiLogOut size={14} />
              Çıkış Yap
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}


