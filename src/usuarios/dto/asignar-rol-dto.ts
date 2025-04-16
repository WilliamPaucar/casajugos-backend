// src/usuarios/dto/asignar-rol.dto.ts
import { IsInt } from 'class-validator';

export class AsignarRolDto {
  @IsInt()
  rolId: number;
}
