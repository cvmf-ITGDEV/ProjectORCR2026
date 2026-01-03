import { redirect } from "next/navigation";
import { RoleGuard } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await RoleGuard.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  if (!user.dbUser.isActive) {
    redirect("/login");
  }

  return <>{children}</>;
}
