import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  action: string;

  @Column({ name: "supabase_user_id", type: "uuid", nullable: true })
  supabaseUserId: string | null;

  @Column({ name: "user_id", type: "uuid", nullable: true })
  userId: string | null;

  @ManyToOne("User")
  @JoinColumn({ name: "user_id" })
  user: unknown;

  @Column({ name: "application_id", type: "uuid", nullable: true })
  applicationId: string | null;

  @ManyToOne("Application")
  @JoinColumn({ name: "application_id" })
  application: unknown;

  @Column({ name: "old_status", nullable: true })
  oldStatus: string | null;

  @Column({ name: "new_status", nullable: true })
  newStatus: string | null;

  @Column({ name: "details", type: "jsonb", nullable: true })
  details: Record<string, unknown> | null;

  @Column({ name: "ip_address", nullable: true })
  ipAddress: string | null;

  @Column({ name: "user_agent", type: "text", nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
