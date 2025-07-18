import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { DetalleVenta } from 'src/detalle-ventas/detalle-venta.entity';

@Entity('ventas')
export class Venta {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    fecha: Date;

    @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @OneToMany(() => DetalleVenta, detalle => detalle.venta, { cascade: true })
    detalles: DetalleVenta[];
}
