import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsNotEmpty()
  precio: number;
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsNotEmpty()
  categoria_id: number; // Aquí recibimos el id de la categoría, no la entidad completa
  @IsOptional()
  @IsString()
  imagen?: string; // ruta o URL
}
