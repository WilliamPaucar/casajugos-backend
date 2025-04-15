import { IsInt, IsOptional } from 'class-validator';

export class CreateVentaDto {
  @IsOptional()
  @IsInt()
  usuarioId?: number;
}
