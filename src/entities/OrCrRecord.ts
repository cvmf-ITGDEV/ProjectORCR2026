import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";

@Entity("or_cr_records")
export class OrCrRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "application_id", type: "uuid", unique: true })
  applicationId: string;

  @OneToOne("Application", "orCrRecord")
  @JoinColumn({ name: "application_id" })
  application: unknown;

  @Column({ name: "or_number", unique: true })
  orNumber: string;

  @Column({ name: "cr_number", unique: true })
  crNumber: string;

  @Column({ name: "issue_date", type: "timestamptz" })
  issueDate: Date;

  @Column({ name: "expiry_date", type: "timestamptz", nullable: true })
  expiryDate: Date | null;

  @Column({ name: "issued_by_user_id", type: "uuid", nullable: true })
  issuedByUserId: string | null;

  @ManyToOne("User")
  @JoinColumn({ name: "issued_by_user_id" })
  issuedBy: unknown;

  @Column({ name: "vehicle_details", type: "jsonb", nullable: true })
  vehicleDetails: Record<string, unknown> | null;

  @Column({ name: "owner_details", type: "jsonb", nullable: true })
  ownerDetails: Record<string, unknown> | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
