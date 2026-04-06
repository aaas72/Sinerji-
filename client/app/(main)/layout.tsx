
import AuthModal from "@/components/auth/AuthModal";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
