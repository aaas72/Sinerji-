import { ReactNode } from "react";
import CompanySidebar from "./CompanySidebar";
import CompanyNavbar from "./CompanyNavbar";

export default function Container({ children }: { children: ReactNode }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isCompany = pathname.startsWith("/company");

  return isCompany ? (
    <div className="flex min-h-screen">
      <CompanySidebar />
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <CompanyNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  ) : (
    <div className="mx-auto max-w-6xl px-4">{children}</div>
  );
}