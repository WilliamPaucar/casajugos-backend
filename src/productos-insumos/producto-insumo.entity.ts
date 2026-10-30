import { Entity, ManyToOne, PrimaryColumn, Column, JoinColumn } from 'typeorm';
import { Producto } from '../productos/producto.entity';
import { Insumo } from '../insumos/insumo.entity';

@Entity('producto_insumo')
export class ProductoInsumo {
  @PrimaryColumn()
  producto_id: number;

  @PrimaryColumn()
  insumo_id: number;

  @ManyToOne(() => Producto, producto => producto.productoInsumos, { eager: true, onDelete: 'CASCADE' })

  @JoinColumn({
    name: 'producto_id',
    foreignKeyConstraintName: 'producto_insumo_producto_id_fkey',
  })
  producto: Producto;

  @ManyToOne(() => Insumo, insumo => insumo.productoInsumos, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'insumo_id',
    foreignKeyConstraintName: 'producto_insumo_insumo_id_fkey',
  })
  insumo: Insumo;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  cantidad_usada: number;
}
