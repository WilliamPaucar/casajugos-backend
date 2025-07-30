// create-detalle-venta.dto.ts
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateDetalleVentaDto {
  @IsInt()
  ventaId: number;

  @IsInt()
  productoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber()
  precioUnitario: number;
  @IsString()
  observacion: string;
}
