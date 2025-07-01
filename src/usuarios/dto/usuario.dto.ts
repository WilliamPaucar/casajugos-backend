// usuario.dto.ts
export class UsuarioDto {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  password_hash:string;
  rol?: {
    id: number;
    nombre: string;
    // otros campos si los necesitas
  };
  activo: boolean;
}

