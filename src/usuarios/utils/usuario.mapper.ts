// src/usuarios/utils/usuario.mapper.ts
import { Usuario } from '../usuario.entity';
import { UsuarioDto } from '../dto/usuario.dto';

export function toUsuarioDto(usuario: Usuario): UsuarioDto {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol_id: usuario.rol?.id,
    rol: usuario.rol
      ? {
          id: usuario.rol.id,
          nombre: usuario.rol.nombre,
        }
      : undefined,
    activo: usuario.activo,
  };
}
