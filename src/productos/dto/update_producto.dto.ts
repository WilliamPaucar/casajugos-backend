import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateProductoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsNumber()
  @IsOptional()
  precio?: number;

  @IsNumber()
  @IsOptional()
  categoria_id?: number; // Esta es una propiedad opcional
}
