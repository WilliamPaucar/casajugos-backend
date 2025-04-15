import { Module } from '@nestjs/common';
import { ProductoInsumoService } from './productos-insumos.service';
import { ProductoInsumoController } from './productos-insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoInsumo } from './producto-insumo.entity';
import { Producto } from 'src/productos/producto.entity';
import { Insumo } from 'src/insumos/insumo.entity';
import { ProductosModule } from 'src/productos/productos.module';
import { InsumosModule } from 'src/insumos/insumos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoInsumo, Producto, Insumo]),
    ProductosModule, // <-- Esto es lo importante
    InsumosModule,   // <-- Y esto también si Insumo está allí
  ],
  providers: [ProductoInsumoService],
  controllers: [ProductoInsumoController]
})
export class ProductosInsumosModule {}
