import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  email: string;

  @Column({ type: 'text' })
  password_hash: string;

  @Column()
  rol_id: number;

  @Column({ default: true })
  activo: boolean;
}
