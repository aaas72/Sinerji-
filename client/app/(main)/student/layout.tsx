
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <Navbar authenticated={false} userName={undefined} role={"student"} />
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </ProtectedRoute>
  );
}
