import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('ventas')
export class Venta {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    fecha: Date;

    @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
      @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;
}
