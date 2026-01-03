import { UserRepository } from "@/repositories/UserRepository";
import { User } from "@/entities/User";

export class UserSyncService {
  static async syncUserOnFirstLogin(
    supabaseUserId: string,
    email: string,
    fullName?: string
  ): Promise<User> {
    let user = await UserRepository.findBySupabaseUserId(supabaseUserId);

    if (!user) {
      user = await UserRepository.create({
        supabaseUserId,
        email,
        fullName: fullName || null,
        role: "processor",
        isActive: true,
      });
    }

    return user;
  }

  static async getUserBySupabaseId(supabaseUserId: string): Promise<User | null> {
    return await UserRepository.findBySupabaseUserId(supabaseUserId);
  }

  static async updateUser(
    supabaseUserId: string,
    updates: Partial<User>
  ): Promise<User | null> {
    const user = await UserRepository.findBySupabaseUserId(supabaseUserId);

    if (!user) {
      return null;
    }

    const updated = await UserRepository.update(user.id, updates);
    return updated;
  }

  static async ensureUserExists(
    supabaseUserId: string,
    email: string,
    fullName?: string
  ): Promise<User> {
    return await this.syncUserOnFirstLogin(supabaseUserId, email, fullName);
  }
}
