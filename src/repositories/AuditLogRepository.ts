import { Repository } from "typeorm";
import { AuditLog } from "@/entities/AuditLog";
import { initializeDataSource } from "@/lib/data-source";

export class AuditLogRepository {
  private static repository: Repository<AuditLog>;

  private static async getRepository(): Promise<Repository<AuditLog>> {
    if (!AuditLogRepository.repository) {
      const dataSource = await initializeDataSource();
      AuditLogRepository.repository = dataSource.getRepository(AuditLog);
    }
    return AuditLogRepository.repository;
  }

  static async findById(id: string): Promise<AuditLog | null> {
    const repo = await AuditLogRepository.getRepository();
    return repo.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  static async findByEntityId(entityId: string): Promise<AuditLog[]> {
    const repo = await AuditLogRepository.getRepository();
    return repo.find({
      where: { entityId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  static async findByEntityType(entityType: string): Promise<AuditLog[]> {
    const repo = await AuditLogRepository.getRepository();
    return repo.find({
      where: { entityType },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  static async findByUserId(userId: string): Promise<AuditLog[]> {
    const repo = await AuditLogRepository.getRepository();
    return repo.find({
      where: { userId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  static async findAll(): Promise<AuditLog[]> {
    const repo = await AuditLogRepository.getRepository();
    return repo.find({
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  static async create(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    const repo = await AuditLogRepository.getRepository();
    const newAuditLog = repo.create(auditLog);
    return repo.save(newAuditLog);
  }

  static async delete(id: string): Promise<boolean> {
    const repo = await AuditLogRepository.getRepository();
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
