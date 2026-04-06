import { ReactNode } from "react";
import CompanySidebar from "@/components/layout/CompanySidebar";
import CompanyNavbar from "@/components/layout/CompanyNavbar";

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <CompanySidebar />
      <div className="ml-56 flex flex-col bg-gray-100 min-h-screen">
        <CompanyNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
