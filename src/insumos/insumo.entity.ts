import { ProductoInsumo } from "src/productos-insumos/producto-insumo.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false} )
  nombre: string;
  @Column()
  cantidad_disponible:number;

  @Column()
  unidad:string;
  @OneToMany(() => ProductoInsumo, pi => pi.insumo)
  productoInsumos: ProductoInsumo[];
}
