import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { DetalleVenta } from 'src/detalle-ventas/detalle-venta.entity';
import { Venta } from 'src/ventas/ventas.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DetalleVenta)
    private readonly detalleRepo: Repository<DetalleVenta>,
    @InjectRepository(Venta)
    private readonly ventaRepo: Repository<Venta>,
  ) {}

  /* =======================
      KPIs
     ======================= */
  async getKpis(from: Date, to: Date) {
    const totalVentasRaw = await this.detalleRepo
      .createQueryBuilder('dv')
      .innerJoin('dv.venta', 'v')
      .where('v.fecha BETWEEN :from AND :to', { from, to })
      .select('SUM(dv.cantidad * dv.precioUnitario)', 'total')
      .getRawOne();

    const totalVentas = Number(totalVentasRaw?.total ?? 0);

    const totalOrdenes = await this.ventaRepo.count({
      where: { fecha: Between(from, to) },
    });

    return {
      totalVentas,
      totalOrdenes,
      ticketPromedio: totalOrdenes ? totalVentas / totalOrdenes : 0,
    };
  }

  /* =======================
      Ventas semanales
     ======================= */
  async getVentasSemanales(from: Date, to: Date) {
    return this.detalleRepo
      .createQueryBuilder('dv')
      .innerJoin('dv.venta', 'v')
      .select("TRIM(TO_CHAR(v.fecha, 'Day'))", 'dia')
      .addSelect('SUM(dv.cantidad * dv.precioUnitario)', 'total')
      .where('v.fecha BETWEEN :from AND :to', { from, to })
      .groupBy('dia')
      .orderBy('total', 'DESC')
      .getRawMany();
  }

  /* =======================
      Ventas mensuales
     ======================= */
  async getVentasMensuales(from: Date, to: Date) {
    return this.detalleRepo
      .createQueryBuilder('dv')
      .innerJoin('dv.venta', 'v')
      .select("TO_CHAR(v.fecha, 'YYYY-MM')", 'mes')
      .addSelect('SUM(dv.cantidad * dv.precioUnitario)', 'total')
      .where('v.fecha BETWEEN :from AND :to', { from, to })
      .groupBy('mes')
      .orderBy('mes', 'ASC')
      .getRawMany();
  }

  /* =======================
      Top productos
     ======================= */
  async getTopProductos(from: Date, to: Date, limit: number) {
    return this.detalleRepo
      .createQueryBuilder('dv')
      .innerJoin('dv.venta', 'v')
      .innerJoin('dv.producto', 'p')
      .innerJoin('p.categoria', 'c')
      .select('p.id', 'productoId')
      .addSelect('p.nombre', 'producto')
      .addSelect('c.nombre', 'categoria')
      .addSelect('SUM(dv.cantidad)', 'cantidad')
      .addSelect('SUM(dv.cantidad * dv.precioUnitario)', 'total')
      .where('v.fecha BETWEEN :from AND :to', { from, to })
      .groupBy('p.id, c.nombre')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  /* =======================
      Top categorías
     ======================= */
  async getTopCategorias(from: Date, to: Date) {
    return this.detalleRepo
      .createQueryBuilder('dv')
      .innerJoin('dv.venta', 'v')
      .innerJoin('dv.producto', 'p')
      .innerJoin('p.categoria', 'c')
      .select('c.nombre', 'categoria')
      .addSelect('SUM(dv.cantidad * dv.precioUnitario)', 'total')
      .where('v.fecha BETWEEN :from AND :to', { from, to })
      .groupBy('c.nombre')
      .orderBy('total', 'DESC')
      .getRawMany();
  }
}
