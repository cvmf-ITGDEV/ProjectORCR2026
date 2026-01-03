import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";

@Entity("ref_province")
export class RefProvince {
  @PrimaryColumn({ name: "psgc_code" })
  psgcCode: string;

  @Column({ name: "prov_desc" })
  provDesc: string;

  @Column({ name: "reg_code" })
  regCode: string;

  @Column({ name: "prov_code" })
  provCode: string;

  @ManyToOne("RefRegion", "provinces")
  @JoinColumn({ name: "reg_code", referencedColumnName: "regCode" })
  region: unknown;

  @OneToMany("RefCity", "province")
  cities: unknown[];
}
