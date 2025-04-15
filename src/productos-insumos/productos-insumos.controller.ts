import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductoInsumoService } from './productos-insumos.service';
import { CreateProductoInsumoDto } from './dto/create-producto-insumo.dto';
import { UpdateProductoInsumoDto } from './dto/update-producto-insumo.dto';

@Controller('producto-insumo')
export class ProductoInsumoController {
  constructor(private readonly service: ProductoInsumoService) {}

  @Post()
  create(@Body() dto: CreateProductoInsumoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':producto_id/:insumo_id')
  findOne(
    @Param('producto_id') producto_id: number,
    @Param('insumo_id') insumo_id: number,
  ) {
    return this.service.findOne(producto_id, insumo_id);
  }

  @Put(':producto_id/:insumo_id')
  update(
    @Param('producto_id') producto_id: number,
    @Param('insumo_id') insumo_id: number,
    @Body() dto: UpdateProductoInsumoDto,
  ) {
    return this.service.update(producto_id, insumo_id, dto);
  }

  @Delete(':producto_id/:insumo_id')
  remove(
    @Param('producto_id') producto_id: number,
    @Param('insumo_id') insumo_id: number,
  ) {
    return this.service.remove(producto_id, insumo_id);
  }
}
