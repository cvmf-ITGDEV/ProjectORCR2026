import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";

@Entity("ref_region")
export class RefRegion {
  @PrimaryColumn({ name: "psgc_code" })
  psgcCode: string;

  @Column({ name: "reg_desc" })
  regDesc: string;

  @Column({ name: "reg_code" })
  regCode: string;

  @OneToMany("RefProvince", "region")
  provinces: unknown[];
}
