import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from 'src/ventas/ventas.entity';
import { Producto } from 'src/productos/producto.entity';

@Entity('detalle_venta')
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 , name:'precio_unitario'})
  precioUnitario: number;

  @ManyToOne(() => Venta, venta => venta.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({name:'venta_id'})
  venta: Venta;

  @ManyToOne(() => Producto, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({name:'producto_id'})
  producto: Producto;
}
