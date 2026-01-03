import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";

@Entity("ref_city")
export class RefCity {
  @PrimaryColumn({ name: "psgc_code" })
  psgcCode: string;

  @Column({ name: "city_desc" })
  cityDesc: string;

  @Column({ name: "reg_code" })
  regCode: string;

  @Column({ name: "prov_code" })
  provCode: string;

  @Column({ name: "city_code" })
  cityCode: string;

  @ManyToOne("RefProvince", "cities")
  @JoinColumn({ name: "prov_code", referencedColumnName: "provCode" })
  province: unknown;
}
