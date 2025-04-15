import { IsInt, IsOptional } from 'class-validator';

export class UpdateVentaDto {
  @IsOptional()
  @IsInt()
  usuarioId?: number;
}
