import { Rol } from 'src/roles/rol.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ type: 'text' })
  password_hash: string;

  @ManyToOne(() => Rol, {
    nullable: false,
    eager: true, // ✔ permite que user.rol venga siempre cargado
  })
  @JoinColumn({
    name: 'rol_id',
    foreignKeyConstraintName: 'usuarios_rol_id_fkey',
  })
  rol: Rol;

  @Column({
    type: 'boolean',
    default: true,
    nullable: true,
  })
  activo: boolean;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string;
}
