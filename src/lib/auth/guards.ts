import { RoleGuard, type AuthUser } from "./role-guards";

export async function withAuth<T>(
  handler: (user: AuthUser) => Promise<T>
): Promise<T> {
  const user = await RoleGuard.requireAuth();
  return handler(user);
}

export async function withAdmin<T>(
  handler: (user: AuthUser) => Promise<T>
): Promise<T> {
  const user = await RoleGuard.requireAdmin();
  return handler(user);
}

export async function withRole<T>(
  role: "admin" | "processor",
  handler: (user: AuthUser) => Promise<T>
): Promise<T> {
  const user = await RoleGuard.requireRole(role);
  return handler(user);
}
