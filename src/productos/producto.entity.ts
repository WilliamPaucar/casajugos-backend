import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Categoria } from 'src/categorias/categoria.entity'

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


}
