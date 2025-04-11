
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateInsumoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsNumber()
  @IsOptional()
  cantidad_disponible?:number;

  @IsString()
  @IsOptional()
  unidad?:string;
}