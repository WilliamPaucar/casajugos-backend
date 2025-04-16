import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { DetalleVentaService } from './detalle-ventas.service';

@Controller('detalle-ventas')
export class DetalleVentaController {
  constructor(private readonly detalleService: DetalleVentaService) {}

  @Post()
  create(@Body() dto: CreateDetalleVentaDto) {
    return this.detalleService.crear(dto);
  }

  @Get()
  findAll() {
    return this.detalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.detalleService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDetalleVentaDto,
  ) {
    return this.detalleService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.detalleService.remove(id);
  }
}
