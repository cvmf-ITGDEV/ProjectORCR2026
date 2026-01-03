import { Repository } from "typeorm";
import { Application } from "@/entities/Application";
import { initializeDataSource } from "@/lib/data-source";

export class ApplicationRepository {
  private static repository: Repository<Application>;

  private static async getRepository(): Promise<Repository<Application>> {
    if (!ApplicationRepository.repository) {
      const dataSource = await initializeDataSource();
      ApplicationRepository.repository = dataSource.getRepository(Application);
    }
    return ApplicationRepository.repository;
  }

  static async findById(id: string): Promise<Application | null> {
    const repo = await ApplicationRepository.getRepository();
    return repo.findOne({
      where: { id },
      relations: ["processor", "orCrRecord"],
    });
  }

  static async findByApplicationNumber(applicationNumber: string): Promise<Application | null> {
    const repo = await ApplicationRepository.getRepository();
    return repo.findOne({
      where: { applicationNumber },
      relations: ["processor", "orCrRecord"],
    });
  }

  static async findByProcessorId(processorId: string): Promise<Application[]> {
    const repo = await ApplicationRepository.getRepository();
    return repo.find({
      where: { processorId },
      relations: ["processor", "orCrRecord"],
      order: { createdAt: "DESC" },
    });
  }

  static async findByStatus(status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "returned" | "active"): Promise<Application[]> {
    const repo = await ApplicationRepository.getRepository();
    return repo.find({
      where: { status },
      relations: ["processor", "orCrRecord"],
      order: { createdAt: "DESC" },
    });
  }

  static async findAll(): Promise<Application[]> {
    const repo = await ApplicationRepository.getRepository();
    return repo.find({
      relations: ["processor", "orCrRecord"],
      order: { createdAt: "DESC" },
    });
  }

  static async create(application: Partial<Application>): Promise<Application> {
    const repo = await ApplicationRepository.getRepository();
    const newApplication = repo.create(application);
    return repo.save(newApplication);
  }

  static async update(id: string, updates: Partial<Application>): Promise<Application> {
    const repo = await ApplicationRepository.getRepository();
    await repo.update(id, updates as any);
    const updated = await repo.findOne({
      where: { id },
      relations: ["processor", "orCrRecord"],
    });
    if (!updated) throw new Error("Application not found after update");
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const repo = await ApplicationRepository.getRepository();
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  static async countByStatus(status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "returned" | "active"): Promise<number> {
    const repo = await ApplicationRepository.getRepository();
    return repo.countBy({ status });
  }

  static async getApplicationsByProcessor(
    processorId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: Application[]; total: number }> {
    const repo = await ApplicationRepository.getRepository();
    const [data, total] = await repo.findAndCount({
      where: { processorId },
      relations: ["processor", "orCrRecord"],
      order: { createdAt: "DESC" },
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 10),
      take: options?.limit ?? 10,
    });
    return { data, total };
  }

  static async getDashboardStats(): Promise<{
    totalApplications: number;
    submittedCount: number;
    approvedCount: number;
    rejectedCount: number;
  }> {
    const repo = await ApplicationRepository.getRepository();
    const [total, submitted, approved, rejected] = await Promise.all([
      repo.count(),
      repo.countBy({ status: "submitted" }),
      repo.countBy({ status: "approved" }),
      repo.countBy({ status: "rejected" }),
    ]);
    return {
      totalApplications: total,
      submittedCount: submitted,
      approvedCount: approved,
      rejectedCount: rejected,
    };
  }

  static async getApplications(options: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: Application[]; total: number }> {
    const repo = await ApplicationRepository.getRepository();
    const where = options.status && options.status !== "all" ? { status: options.status as any } : {};

    const [data, total] = await repo.findAndCount({
      where,
      relations: ["processor", "orCrRecord"],
      order: { createdAt: "DESC" },
      skip: ((options.page ?? 1) - 1) * (options.limit ?? 20),
      take: options.limit ?? 20,
    });
    return { data, total };
  }
}

// Export as functions for convenience
export async function getApplications(options: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ data: Application[]; total: number }> {
  return ApplicationRepository.getApplications(options);
}

export async function getApplicationsByProcessor(
  processorId: string,
  options?: { page?: number; limit?: number }
): Promise<{ data: Application[]; total: number }> {
  return ApplicationRepository.getApplicationsByProcessor(processorId, options);
}

export async function getDashboardStats(): Promise<{
  totalApplications: number;
  submittedCount: number;
  approvedCount: number;
  rejectedCount: number;
}> {
  return ApplicationRepository.getDashboardStats();
}
