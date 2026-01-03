import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "@/entities/User";
import { Application } from "@/entities/Application";
import { OrCrRecord } from "@/entities/OrCrRecord";
import { AuditLog } from "@/entities/AuditLog";
import { RefRegion } from "@/entities/RefRegion";
import { RefProvince } from "@/entities/RefProvince";
import { RefCity } from "@/entities/RefCity";

let dataSource: DataSource | null = null;
let initializationPromise: Promise<DataSource> | null = null;

export function getDataSource(): DataSource {
  if (dataSource) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [User, Application, OrCrRecord, AuditLog, RefRegion, RefProvince, RefCity],
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    ssl: {
      rejectUnauthorized: false,
    },
    extra: {
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    },
  });

  return dataSource;
}

export async function initializeDataSource(): Promise<DataSource> {
  if (dataSource?.isInitialized) {
    return dataSource;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const ds = getDataSource();

    if (!ds.isInitialized) {
      try {
        await ds.initialize();
      } catch (error) {
        initializationPromise = null;
        throw error;
      }
    }

    return ds;
  })();

  return initializationPromise;
}

if (typeof window === "undefined") {
  if (process.env.NODE_ENV !== "production") {
    const globalForDataSource = global as typeof globalThis & {
      __dataSourceInstance?: DataSource;
    };

    if (!globalForDataSource.__dataSourceInstance) {
      globalForDataSource.__dataSourceInstance = getDataSource();
    }

    dataSource = globalForDataSource.__dataSourceInstance;
  }
}
