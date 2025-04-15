import { IsString, IsEmail, IsBoolean, IsInt, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  rol_id: number;

  @IsBoolean()
  activo?: boolean;
}
