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

    if (!isAuthenticated) {
      router.replace("/");
      setTimeout(() => openLogin(), 100);
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [isAuthenticated, user, router, allowedRoles, _hasHydrated, openLogin]);

  // لا تعرض أي شيء إطلاقاً حتى يتم التأكد من حالة المصادقة
  if (!_hasHydrated || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
