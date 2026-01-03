import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/repositories/UserRepository";
import { User } from "@/entities/User";

export type UserRole = "admin" | "processor";

export interface AuthUser {
  supabaseUserId: string;
  dbUser: User;
  role: UserRole;
  isAdmin: boolean;
}

export class RoleGuard {
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      const dbUser = await UserRepository.findBySupabaseUserId(user.id);

      if (!dbUser) {
        return null;
      }

      if (!dbUser.isActive) {
        return null;
      }

      return {
        supabaseUserId: user.id,
        dbUser,
        role: dbUser.role,
        isAdmin: dbUser.role === "admin",
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized: Authentication required");
    }

    return user;
  }

  static async requireAdmin(): Promise<AuthUser> {
    const user = await this.requireAuth();

    if (!user.isAdmin) {
      throw new Error("Forbidden: Admin access required");
    }

    return user;
  }

  static async requireRole(role: UserRole): Promise<AuthUser> {
    const user = await this.requireAuth();

    if (user.role !== role) {
      throw new Error(`Forbidden: ${role} role required`);
    }

    return user;
  }

  static async checkPermission(
    requiredRole: UserRole | UserRole[]
  ): Promise<boolean> {
    const user = await this.getCurrentUser();

    if (!user) {
      return false;
    }

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
  }

  static async hasAdminAccess(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.isAdmin ?? false;
  }

  static async getUserRole(): Promise<UserRole | null> {
    const user = await this.getCurrentUser();
    return user?.role ?? null;
  }
}
