import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "entity_type" })
  entityType: string;

  @Column({ name: "entity_id" })
  entityId: string;

  @Column()
  action: string;

  @Column({ name: "old_values", type: "jsonb", nullable: true })
  oldValues: Record<string, unknown> | null;

  @Column({ name: "new_values", type: "jsonb", nullable: true })
  newValues: Record<string, unknown> | null;

  @Column({ name: "user_id", nullable: true })
  userId: string | null;

  @ManyToOne("User")
  @JoinColumn({ name: "user_id" })
  user: unknown;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
