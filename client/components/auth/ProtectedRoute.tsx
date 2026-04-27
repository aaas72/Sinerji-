"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../hooks/useAuth";
import { useAuthModal } from "../../hooks/useAuthModal";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const { openLogin } = useAuthModal();
  const router = useRouter();

  useEffect(() => {
    // Do not redirect until hydration is complete
    if (!_hasHydrated) return;

    console.log("ProtectedRoute - Auth Check:", { isAuthenticated, role: user?.role, allowedRoles });

    if (!isAuthenticated) {
      console.warn("ProtectedRoute: No authentication found, redirecting to home.");
      router.replace("/");
      setTimeout(() => openLogin(), 100);
    } else if (allowedRoles && user) {
      // تحويل الأدوار إلى أحرف صغيرة للمقارنة بشكل غير حساس لحالة الأحرف
      const userRole = user.role.toLowerCase();
      const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole);
      
      if (!isAllowed) {
        console.warn(`ProtectedRoute: Role mismatch. Current: ${user.role}, Allowed: ${allowedRoles}. Redirecting.`);
        router.replace("/");
      }
    }
  }, [isAuthenticated, user, router, allowedRoles, _hasHydrated, openLogin]);



  // لا تعرض أي شيء إطلاقاً حتى يتم التأكد من حالة المصادقة
  const isAllowed = !allowedRoles || !user ? true : allowedRoles.some(r => r.toLowerCase() === user.role.toLowerCase());
  
  if (!_hasHydrated || !isAuthenticated || !isAllowed) {
    return null;
  }

  return <>{children}</>;
};


export default ProtectedRoute;
