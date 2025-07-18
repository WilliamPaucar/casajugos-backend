import { Module } from '@nestjs/common';
import { DetalleVentaService } from './detalle-ventas.service';
import { DetalleVentaController } from './detalle-ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleVenta } from './detalle-venta.entity';
import { Producto } from 'src/productos/producto.entity';
import { Venta } from 'src/ventas/ventas.entity';
import { ProductosModule } from 'src/productos/productos.module';

@Module({
  imports:[TypeOrmModule.forFeature([DetalleVenta,Producto, Venta]),ProductosModule],
  providers: [DetalleVentaService],
  controllers: [DetalleVentaController],
  exports: [DetalleVentaService], // 👈 Esto es lo importante
})
export class DetalleVentasModule {}
