// src/roles/entities/rol.entity.ts
import { Usuario } from 'src/usuarios/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';

@Entity('roles')
@Unique('roles_nombre_key', ['nombre'])
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nombre: string;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[]; // 👈 relación inversa (opcional)
}
