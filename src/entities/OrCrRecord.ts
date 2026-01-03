import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";

@Entity("or_cr_records")
export class OrCrRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "application_id" })
  applicationId: string;

  @OneToOne("Application", "orCrRecord")
  @JoinColumn({ name: "application_id" })
  application: unknown;

  @Column({ name: "or_number", unique: true })
  orNumber: string;

  @Column({ name: "cr_number", unique: true })
  crNumber: string;

  @Column({ name: "issue_date", type: "date" })
  issueDate: Date;

  @Column({ name: "expiry_date", type: "date", nullable: true })
  expiryDate: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
