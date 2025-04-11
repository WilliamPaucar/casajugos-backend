import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  precio: number;

  @IsNumber()
  @IsNotEmpty()
  categoria_id: number; // Aquí recibimos el id de la categoría, no la entidad completa
}
