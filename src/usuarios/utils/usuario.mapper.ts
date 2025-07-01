// usuario.mapper.ts

import { Usuario } from '../usuario.entity';
import { UsuarioDto } from '../dto/usuario.dto';

export function toUsuarioDto(user: Usuario): UsuarioDto {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    password_hash:user.password_hash,
    rol_id: user.rol?.id ?? 0,
    rol: user.rol
      ? {
          id: user.rol.id,
          nombre: user.rol.nombre,
        }
      : undefined,
    activo: user.activo,
  };
}
