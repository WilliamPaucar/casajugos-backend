import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductoInsumoDto {
  @IsInt()
  @IsOptional()
  productoId?: number;

  @IsInt()
  @IsOptional()
  insumoId?: number;

  @IsNumber()
  @IsOptional()
  cantidad_usada?: number;
}
