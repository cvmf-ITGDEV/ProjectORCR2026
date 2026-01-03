import { Repository } from "typeorm";
import { RefRegion } from "@/entities/RefRegion";
import { RefProvince } from "@/entities/RefProvince";
import { RefCity } from "@/entities/RefCity";
import { initializeDataSource } from "@/lib/data-source";

export class PSGCRepository {
  private static regionRepository: Repository<RefRegion>;
  private static provinceRepository: Repository<RefProvince>;
  private static cityRepository: Repository<RefCity>;

  private static async getRepositories() {
    if (!PSGCRepository.regionRepository) {
      const dataSource = await initializeDataSource();
      PSGCRepository.regionRepository = dataSource.getRepository(RefRegion);
      PSGCRepository.provinceRepository = dataSource.getRepository(RefProvince);
      PSGCRepository.cityRepository = dataSource.getRepository(RefCity);
    }
    return {
      region: PSGCRepository.regionRepository,
      province: PSGCRepository.provinceRepository,
      city: PSGCRepository.cityRepository,
    };
  }

  // Region methods
  static async findAllRegions(): Promise<RefRegion[]> {
    const { region } = await PSGCRepository.getRepositories();
    return region.find({
      relations: ["provinces"],
      order: { regDesc: "ASC" },
    });
  }

  static async findRegionByCode(psgcCode: string): Promise<RefRegion | null> {
    const { region } = await PSGCRepository.getRepositories();
    return region.findOne({
      where: { psgcCode },
      relations: ["provinces"],
    });
  }

  // Province methods
  static async findAllProvinces(): Promise<RefProvince[]> {
    const { province } = await PSGCRepository.getRepositories();
    return province.find({
      relations: ["region", "cities"],
      order: { provDesc: "ASC" },
    });
  }

  static async findProvincesByRegion(regCode: string): Promise<RefProvince[]> {
    const { province } = await PSGCRepository.getRepositories();
    return province.find({
      where: { regCode },
      relations: ["region", "cities"],
      order: { provDesc: "ASC" },
    });
  }

  static async findProvinceByCode(psgcCode: string): Promise<RefProvince | null> {
    const { province } = await PSGCRepository.getRepositories();
    return province.findOne({
      where: { psgcCode },
      relations: ["region", "cities"],
    });
  }

  // City methods
  static async findAllCities(): Promise<RefCity[]> {
    const { city } = await PSGCRepository.getRepositories();
    return city.find({
      relations: ["province"],
      order: { cityDesc: "ASC" },
    });
  }

  static async findCitiesByProvince(provCode: string): Promise<RefCity[]> {
    const { city } = await PSGCRepository.getRepositories();
    return city.find({
      where: { provCode },
      relations: ["province"],
      order: { cityDesc: "ASC" },
    });
  }

  static async findCityByCode(psgcCode: string): Promise<RefCity | null> {
    const { city } = await PSGCRepository.getRepositories();
    return city.findOne({
      where: { psgcCode },
      relations: ["province"],
    });
  }

  // Search methods
  static async searchProvinces(query: string): Promise<RefProvince[]> {
    const { province } = await PSGCRepository.getRepositories();
    return province.createQueryBuilder("p")
      .leftJoinAndSelect("p.region", "region")
      .leftJoinAndSelect("p.cities", "cities")
      .where("p.provDesc ILIKE :query", { query: `%${query}%` })
      .orderBy("p.provDesc", "ASC")
      .getMany();
  }

  static async searchCities(query: string): Promise<RefCity[]> {
    const { city } = await PSGCRepository.getRepositories();
    return city.createQueryBuilder("c")
      .leftJoinAndSelect("c.province", "province")
      .where("c.cityDesc ILIKE :query", { query: `%${query}%` })
      .orderBy("c.cityDesc", "ASC")
      .getMany();
  }
}
