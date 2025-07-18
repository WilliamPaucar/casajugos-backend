import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './ventas.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { DetalleVenta } from 'src/detalle-ventas/detalle-venta.entity';
import { Producto } from 'src/productos/producto.entity';
import { Insumo } from 'src/insumos/insumo.entity';
import { ProductoInsumo } from 'src/productos-insumos/producto-insumo.entity';
import { DetalleVentasModule } from 'src/detalle-ventas/detalle-ventas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, Usuario, Venta,
    DetalleVenta,
    Producto,
    Insumo,
    ProductoInsumo,]),DetalleVentasModule],

  providers: [VentasService],
  controllers: [VentasController]
})
export class VentasModule { }
