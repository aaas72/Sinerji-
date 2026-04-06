"use client";

import { useState } from "react";
import { FiSearch, FiBell } from "react-icons/fi";
import { useAuthStore } from "@/hooks/useAuth";

export default function CompanyNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();

  // Derive display name and role label
  const displayName = user?.email?.split("@")[0] || "User";
  const roleLabel =
    user?.role === "admin"
      ? "Süper Admin"
      : user?.role === "company"
        ? "Şirket"
        : user?.role === "student"
          ? "Öğrenci"
          : "Kullanıcı";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-white h-14 flex items-center px-6 justify-between z-20 border-b border-gray-100">
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <div className="relative w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kullanıcı şi görev ara..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Right Side: Notification + User Info */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <button className="relative text-gray-500 hover:text-primary transition-colors">
          <FiBell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
            <p className="text-xs text-gray-400 leading-tight">{roleLabel}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#004d40] flex items-center justify-center text-white font-bold text-sm">
            {avatarLetter}
          </div>
        </div>
      </div>
    </header>
  );
}
