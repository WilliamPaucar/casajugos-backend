import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './producto.entity';
import { Categoria } from 'src/categorias/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria])],
  exports:[ProductosService],
  controllers: [ProductosController],
  providers: [ProductosService]
})
export class ProductosModule {}
