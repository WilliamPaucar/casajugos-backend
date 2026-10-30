import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { DetalleVenta } from 'src/detalle-ventas/detalle-venta.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_ventas_fecha')
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  fecha: Date;
  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'usuario_id',
    foreignKeyConstraintName: 'ventas_usuario_id_fkey',
  })
  usuario: Usuario;
  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];
}
