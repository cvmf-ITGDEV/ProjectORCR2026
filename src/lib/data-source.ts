import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "@/entities/User";
import { Application } from "@/entities/Application";
import { OrCrRecord } from "@/entities/OrCrRecord";
import { AuditLog } from "@/entities/AuditLog";
import { RefRegion } from "@/entities/RefRegion";
import { RefProvince } from "@/entities/RefProvince";
import { RefCity } from "@/entities/RefCity";

let dataSource: DataSource;

export function getDataSource(): DataSource {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [User, Application, OrCrRecord, AuditLog, RefRegion, RefProvince, RefCity],
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
  });

  return dataSource;
}

export async function initializeDataSource(): Promise<DataSource> {
  const ds = getDataSource();
  if (!ds.isInitialized) {
    await ds.initialize();
  }
  return ds;
}
