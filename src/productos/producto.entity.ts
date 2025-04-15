import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Categoria } from 'src/categorias/categoria.entity'
import { ProductoInsumo } from 'src/productos-insumos/producto-insumo.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column('numeric', { precision: 10, scale: 2 })
  precio: number;
  @ManyToOne(() => Categoria, (categoria) => categoria.productos, { eager: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @OneToMany(() => ProductoInsumo, pi => pi.producto)
  productoInsumos: ProductoInsumo[];

}
