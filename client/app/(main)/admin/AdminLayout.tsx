"use client";

import { ReactNode } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import CompanyNavbar from "@/components/layout/CompanyNavbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AdminSidebar />
      <div className="md:ml-56 flex flex-col bg-gray-50 min-h-screen">
        <CompanyNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
