import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Venta } from 'src/ventas/ventas.entity';
import { Producto } from 'src/productos/producto.entity';
@Entity('detalle_venta')
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'precio_unitario' })
  precioUnitario: number;

  @Index('idx_detalle_venta_venta')
  @ManyToOne(() => Venta, (venta) => venta.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'venta_id',
    foreignKeyConstraintName: 'detalle_venta_venta_id_fkey',
  })
  venta: Venta;

  @Index('idx_detalle_venta_producto')
  @ManyToOne(() => Producto, {
    eager: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'producto_id',
    foreignKeyConstraintName: 'detalle_venta_producto_id_fkey',
  })
  producto: Producto;

  @Column({ type: 'varchar', length: 100, nullable: true })
  observacion?: string;
}
