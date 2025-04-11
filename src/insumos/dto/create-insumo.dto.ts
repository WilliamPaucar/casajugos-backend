import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateInsumoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  cantidad_disponible:number;

  @IsString()
  @IsNotEmpty()
  unidad:string;
}
