import { Controller, Get, Post, Body, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-ventas.dto';
import { Venta } from './ventas.entity';
import { UpdateVentaDto } from './dto/update-ventas.dto';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  crear(@Body() dto: CreateVentaDto): Promise<Venta> {
    return this.ventasService.crearVenta(dto);
  }

  @Get()
  obtenerTodas(): Promise<Venta[]> {
    return this.ventasService.obtenerTodas();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<Venta> {
    return this.ventasService.obtenerPorId(id);
  }
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVentaDto,
  ): Promise<Venta> {
    return this.ventasService.actualizarVenta(id, dto);
  }
  
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ventasService.eliminarVenta(id);
  }

}
