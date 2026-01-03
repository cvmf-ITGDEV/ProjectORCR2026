import { Repository } from "typeorm";
import { OrCrRecord } from "@/entities/OrCrRecord";
import { initializeDataSource } from "@/lib/data-source";

export class OrCrRepository {
  private static repository: Repository<OrCrRecord>;

  private static async getRepository(): Promise<Repository<OrCrRecord>> {
    if (!OrCrRepository.repository) {
      const dataSource = await initializeDataSource();
      OrCrRepository.repository = dataSource.getRepository(OrCrRecord);
    }
    return OrCrRepository.repository;
  }

  static async findById(id: string): Promise<OrCrRecord | null> {
    const repo = await OrCrRepository.getRepository();
    return repo.findOne({
      where: { id },
      relations: ["application"],
    });
  }

  static async findByApplicationId(applicationId: string): Promise<OrCrRecord | null> {
    const repo = await OrCrRepository.getRepository();
    return repo.findOne({
      where: { applicationId },
      relations: ["application"],
    });
  }

  static async findByOrNumber(orNumber: string): Promise<OrCrRecord | null> {
    const repo = await OrCrRepository.getRepository();
    return repo.findOne({
      where: { orNumber },
      relations: ["application"],
    });
  }

  static async findByCrNumber(crNumber: string): Promise<OrCrRecord | null> {
    const repo = await OrCrRepository.getRepository();
    return repo.findOne({
      where: { crNumber },
      relations: ["application"],
    });
  }

  static async findAll(): Promise<OrCrRecord[]> {
    const repo = await OrCrRepository.getRepository();
    return repo.find({
      relations: ["application"],
      order: { createdAt: "DESC" },
    });
  }

  static async create(orCrRecord: Partial<OrCrRecord>): Promise<OrCrRecord> {
    const repo = await OrCrRepository.getRepository();
    const newRecord = repo.create(orCrRecord);
    return repo.save(newRecord);
  }

  static async update(id: string, updates: Partial<OrCrRecord>): Promise<OrCrRecord> {
    const repo = await OrCrRepository.getRepository();
    await repo.update(id, updates as any);
    const updated = await repo.findOne({
      where: { id },
      relations: ["application"],
    });
    if (!updated) throw new Error("OrCrRecord not found after update");
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const repo = await OrCrRepository.getRepository();
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  static async findExpiredRecords(): Promise<OrCrRecord[]> {
    const repo = await OrCrRepository.getRepository();
    return repo.createQueryBuilder("orCr")
      .leftJoinAndSelect("orCr.application", "application")
      .where("orCr.expiryDate IS NOT NULL AND orCr.expiryDate < NOW()")
      .orderBy("orCr.expiryDate", "ASC")
      .getMany();
  }
}
