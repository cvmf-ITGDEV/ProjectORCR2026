import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";

@Entity("ref_city")
export class RefCity {
  @PrimaryColumn({ name: "psgc_code" })
  psgcCode: string;

  @Column({ name: "city_mun_desc" })
  cityMunDesc: string;

  @Column({ name: "reg_code" })
  regCode: string;

  @Column({ name: "prov_code" })
  provCode: string;

  @Column({ name: "city_mun_code" })
  cityMunCode: string;

  @ManyToOne("RefProvince", "cities")
  @JoinColumn({ name: "prov_code", referencedColumnName: "provCode" })
  province: unknown;
}
