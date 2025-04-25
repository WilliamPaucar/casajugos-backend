import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update_producto.dto';
import { Producto } from './producto.entity';
//Autenticacion t Proteccion de rutas
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard) // 👈 aplica a todo el controlador
@Controller('productos')

export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles('admin') // 👈 solo admins pueden crear
  async create(@Body() createProductoDto: CreateProductoDto): Promise<Producto> {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  async findAll(): Promise<Producto[]> {
    const productos = await this.productosService.findAll();
    // console.log('Productos en el controlador:', productos);  // También puedes imprimir aquí
    return productos;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Producto> {
    return this.productosService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @Roles('admin') // 👈 solo admins pueden eliminar
  async remove(@Param('id') id: number): Promise<void> {
    return this.productosService.remove(id);
  }
}
