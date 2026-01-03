import { Repository } from "typeorm";
import { User } from "@/entities/User";
import { initializeDataSource } from "@/lib/data-source";

export class UserRepository {
  private static repository: Repository<User>;

  private static async getRepository(): Promise<Repository<User>> {
    if (!UserRepository.repository) {
      const dataSource = await initializeDataSource();
      UserRepository.repository = dataSource.getRepository(User);
    }
    return UserRepository.repository;
  }

  static async findById(id: string): Promise<User | null> {
    const repo = await UserRepository.getRepository();
    return repo.findOne({ where: { id } });
  }

  static async findByEmail(email: string): Promise<User | null> {
    const repo = await UserRepository.getRepository();
    return repo.findOne({ where: { email } });
  }

  static async findBySupabaseUserId(supabaseUserId: string): Promise<User | null> {
    const repo = await UserRepository.getRepository();
    return repo.findOne({ where: { supabaseUserId } });
  }

  static async create(user: Partial<User>): Promise<User> {
    const repo = await UserRepository.getRepository();
    const newUser = repo.create(user);
    return repo.save(newUser);
  }

  static async update(id: string, updates: Partial<User>): Promise<User> {
    const repo = await UserRepository.getRepository();
    await repo.update(id, updates as any);
    const updated = await repo.findOne({ where: { id } });
    if (!updated) throw new Error("User not found after update");
    return updated;
  }

  static async findAll(): Promise<User[]> {
    const repo = await UserRepository.getRepository();
    return repo.find();
  }

  static async delete(id: string): Promise<boolean> {
    const repo = await UserRepository.getRepository();
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  static async findOrCreateUser(data: { supabaseUserId: string; email: string; fullName?: string }): Promise<User> {
    let user = await UserRepository.findBySupabaseUserId(data.supabaseUserId);
    if (!user) {
      user = await UserRepository.create(data);
    }
    return user;
  }
}

// Export as function for convenience
export async function findOrCreateUser(data: { supabaseUserId: string; email: string; fullName?: string }): Promise<User> {
  return UserRepository.findOrCreateUser(data);
}
