
import {
  IsArray,
  IsInt,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductoVentaDto {
  @IsInt()
  productoId: number;

  @IsInt()
  @IsPositive()
  cantidad: number;

  @IsString()
  observacion: string;
}

export class CreateVentaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoVentaDto)
  productos: ProductoVentaDto[];
}
