import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DetalleVenta } from 'src/detalle-ventas/detalle-venta.entity';
import { Venta } from 'src/ventas/ventas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleVenta, Venta])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
