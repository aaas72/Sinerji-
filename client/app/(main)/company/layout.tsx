"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CompanyLayout from "./CompanyLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["company"]}>
      <CompanyLayout>{children}</CompanyLayout>
    </ProtectedRoute>
  );
}
