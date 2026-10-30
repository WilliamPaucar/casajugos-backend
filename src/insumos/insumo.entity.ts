import { ProductoInsumo } from "src/productos-insumos/producto-insumo.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  cantidad_disponible: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  unidad: string;
  @OneToMany(() => ProductoInsumo, pi => pi.insumo)
  productoInsumos: ProductoInsumo[];
}
