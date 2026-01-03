import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm";

@Entity("applications")
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "application_number", unique: true })
  applicationNumber: string;

  @Column({ default: "draft" })
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "returned" | "active";

  @Column({ name: "wizard_step", default: 1 })
  wizardStep: number;

  @Column({ name: "borrower_name", nullable: true })
  borrowerName: string | null;

  @Column({ name: "borrower_email", nullable: true })
  borrowerEmail: string | null;

  @Column({ name: "borrower_phone", nullable: true })
  borrowerPhone: string | null;

  @Column({ name: "borrower_address", nullable: true })
  borrowerAddress: string | null;

  @Column({ name: "vehicle_make", nullable: true })
  vehicleMake: string | null;

  @Column({ name: "vehicle_model", nullable: true })
  vehicleModel: string | null;

  @Column({ name: "vehicle_year", type: "int", nullable: true })
  vehicleYear: number | null;

  @Column({ name: "plate_number", nullable: true })
  plateNumber: string | null;

  @Column({ name: "engine_number", nullable: true })
  engineNumber: string | null;

  @Column({ name: "chassis_number", nullable: true })
  chassisNumber: string | null;

  @Column({ name: "loan_amount", type: "decimal", precision: 12, scale: 2, default: 0 })
  loanAmount: number;

  @Column({ name: "loan_term_months", type: "int", default: 12 })
  loanTermMonths: number;

  @Column({ name: "interest_rate", type: "decimal", precision: 5, scale: 2, default: 0 })
  interestRate: number;

  @Column({ name: "monthly_payment", type: "decimal", precision: 12, scale: 2, default: 0 })
  monthlyPayment: number;

  @Column({ name: "processor_id", nullable: true })
  processorId: string | null;

  @ManyToOne("User", "processedApplications")
  @JoinColumn({ name: "processor_id" })
  processor: unknown;

  @OneToOne("OrCrRecord", "application")
  orCrRecord: unknown;

  @Column({ name: "submitted_at", nullable: true })
  submittedAt: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
