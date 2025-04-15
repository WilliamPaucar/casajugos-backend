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
  
  @JoinColumn({ name: 'producto_id' }) // 👈 importante
  producto: Producto;
  
  @ManyToOne(() => Insumo, insumo => insumo.productoInsumos, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'insumo_id' }) // 👈 importante
  insumo: Insumo;

  @Column('decimal')
  cantidad_usada: number;
}
