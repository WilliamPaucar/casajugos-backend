import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta } from './ventas.entity';

import { Usuario } from 'src/usuarios/usuario.entity';
import { DetalleVenta } from 'src/detalle-ventas/detalle-venta.entity';
import { Producto } from 'src/productos/producto.entity';
import { Insumo } from 'src/insumos/insumo.entity';
import { ProductoInsumo } from 'src/productos-insumos/producto-insumo.entity';

import { DetalleVentasModule } from 'src/detalle-ventas/detalle-ventas.module';
import { VentasGateway } from 'src/ventas/gateway/ventas.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      Usuario,
      DetalleVenta,
      Producto,
      Insumo,
      ProductoInsumo,
    ]),
    DetalleVentasModule,
  ],
  controllers: [VentasController],
  providers: [
    VentasService,
    VentasGateway, // 👈 NECESARIO
  ],
})
export class VentasModule {}
