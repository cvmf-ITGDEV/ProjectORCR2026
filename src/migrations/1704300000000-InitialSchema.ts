import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1704300000000 implements MigrationInterface {
  name = "InitialSchema1704300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "supabase_user_id" uuid NOT NULL UNIQUE,
        "email" varchar NOT NULL UNIQUE,
        "full_name" varchar,
        "role" varchar DEFAULT 'processor',
        "is_active" boolean DEFAULT true,
        "created_at" timestamptz DEFAULT now(),
        "updated_at" timestamptz DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_supabase_id"
      ON "users" ("supabase_user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_role"
      ON "users" ("role")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ref_region" (
        "psgc_code" varchar PRIMARY KEY,
        "reg_desc" varchar NOT NULL,
        "reg_code" varchar NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_ref_region_code"
      ON "ref_region" ("reg_code")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ref_province" (
        "psgc_code" varchar PRIMARY KEY,
        "prov_desc" varchar NOT NULL,
        "reg_code" varchar NOT NULL,
        "prov_code" varchar NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_ref_province_reg_code"
      ON "ref_province" ("reg_code")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_ref_province_prov_code"
      ON "ref_province" ("prov_code")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ref_city" (
        "psgc_code" varchar PRIMARY KEY,
        "city_mun_desc" varchar NOT NULL,
        "reg_code" varchar NOT NULL,
        "prov_code" varchar NOT NULL,
        "city_mun_code" varchar NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_ref_city_prov_code"
      ON "ref_city" ("prov_code")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_ref_city_code"
      ON "ref_city" ("city_mun_code")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "application_number" varchar NOT NULL UNIQUE,
        "status" varchar DEFAULT 'draft',
        "borrower_name" varchar NOT NULL DEFAULT '',
        "borrower_email" varchar,
        "borrower_phone" varchar,
        "borrower_address" text,
        "region_code" varchar,
        "province_code" varchar,
        "city_code" varchar,
        "vehicle_make" varchar,
        "vehicle_model" varchar,
        "vehicle_year" integer,
        "plate_number" varchar,
        "engine_number" varchar,
        "chassis_number" varchar,
        "loan_amount" numeric(12, 2),
        "loan_term_months" integer,
        "interest_rate" numeric(5, 2),
        "monthly_payment" numeric(12, 2),
        "wizard_step" integer DEFAULT 1,
        "additional_data" jsonb,
        "processor_id" uuid,
        "created_at" timestamptz DEFAULT now(),
        "updated_at" timestamptz DEFAULT now(),
        "submitted_at" timestamptz,
        "approved_at" timestamptz,
        CONSTRAINT "fk_applications_processor"
          FOREIGN KEY ("processor_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_applications_status"
      ON "applications" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_applications_borrower_name"
      ON "applications" ("borrower_name")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_applications_processor_id"
      ON "applications" ("processor_id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "or_cr_records" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "or_number" varchar NOT NULL UNIQUE,
        "cr_number" varchar NOT NULL UNIQUE,
        "application_id" uuid NOT NULL UNIQUE,
        "issue_date" timestamptz NOT NULL,
        "expiry_date" timestamptz,
        "issued_by_user_id" uuid,
        "vehicle_details" jsonb,
        "owner_details" jsonb,
        "created_at" timestamptz DEFAULT now(),
        CONSTRAINT "fk_or_cr_application"
          FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_or_cr_issued_by"
          FOREIGN KEY ("issued_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_or_cr_or_number"
      ON "or_cr_records" ("or_number")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_or_cr_cr_number"
      ON "or_cr_records" ("cr_number")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "action" varchar NOT NULL,
        "supabase_user_id" uuid,
        "user_id" uuid,
        "application_id" uuid,
        "old_status" varchar,
        "new_status" varchar,
        "details" jsonb,
        "ip_address" varchar,
        "user_agent" text,
        "created_at" timestamptz DEFAULT now(),
        CONSTRAINT "fk_audit_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_audit_application"
          FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_action"
      ON "audit_logs" ("action")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_application_id"
      ON "audit_logs" ("application_id")
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_applications_updated_at
      BEFORE UPDATE ON applications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_applications_updated_at ON applications`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON users`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "or_cr_records" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "applications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ref_city" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ref_province" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ref_region" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
  }
}
