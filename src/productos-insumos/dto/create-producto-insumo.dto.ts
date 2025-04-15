// create-producto-insumo.dto.ts
import { IsNumber, IsPositive } from 'class-validator';

export class CreateProductoInsumoDto {
  @IsNumber()
  producto_id: number;

  @IsNumber()
  insumo_id: number;

  @IsNumber()
  @IsPositive()
  cantidad_usada: number;
}
