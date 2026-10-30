import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Categoria } from 'src/categorias/categoria.entity';
import { ProductoInsumo } from 'src/productos-insumos/producto-insumo.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column('numeric', { precision: 10, scale: 2 })
  precio: number;
  @ManyToOne(() => Categoria, (categoria) => categoria.productos, {
    eager: true,
  })
  @JoinColumn({
    name: 'categoria_id',
    foreignKeyConstraintName: 'productos_categoria_id_fkey',
  })
  categoria: Categoria;

  @OneToMany(() => ProductoInsumo, (pi) => pi.producto)
  productoInsumos: ProductoInsumo[];
  // 👇 Nuevo campo para guardar la ruta o URL de la imagen
  @Column({ nullable: true })
  imagen: string;
}
