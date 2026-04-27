import { cookies } from "next/headers";
import Navbar from "./Navbar";

export default async function NavbarWrapper() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  const userName = cookieStore.get("user_name")?.value;
  const userRole = cookieStore.get("user_role")?.value as
    | "student"
    | "company"
    | "guest"
    | undefined;

  return <Navbar authenticated={!!authToken} userName={userName} role={userRole} />;
}
