import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "supabase_user_id", type: "uuid", unique: true })
  supabaseUserId: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: "full_name", nullable: true })
  fullName: string | null;

  @Column({ default: "processor" })
  role: "admin" | "processor";

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  @OneToMany("Application", "processor")
  processedApplications: unknown[];
}
