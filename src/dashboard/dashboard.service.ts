import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // 📊 ENDPOINT PRINCIPAL DEL DASHBOARD DINÁMICO
  async obtenerMetricasDashboard(fromStr?: string, toStr?: string) {
    let inicioFiltro: Date;
    let finFiltro: Date;

    // Si el frontend envía fechas en los query params, las procesamos
    if (fromStr && toStr) {
      inicioFiltro = new Date(`${fromStr}T00:00:00.000Z`);
      finFiltro = new Date(`${toStr}T23:59:59.999Z`);
    } else {
      // Por defecto, tomamos el día de hoy
      const hoy = new Date();
      inicioFiltro = new Date(hoy.setHours(0, 0, 0, 0));
      finFiltro = new Date(hoy.setHours(23, 59, 59, 999));
    }

    // 1. Cálculos de KPIs utilizando el rango de fechas seleccionado
    const metricasRango = await this.ventaRepo
      .createQueryBuilder('venta')
      .leftJoin('venta.detalles', 'detalle')
      .select('COUNT(DISTINCT venta.id)', 'totalOrdenes')
      .addSelect('SUM(detalle.cantidad * detalle.precioUnitario)', 'totalIngresos')
      .where('venta.fecha BETWEEN :inicio AND :fin', { inicio: inicioFiltro, fin: finFiltro })
      .getRawOne();

    const totalVentas = parseFloat(metricasRango.totalIngresos) || 0;
    const totalOrdenes = parseInt(metricasRango.totalOrdenes) || 0;

    // 2. Top Productos más vendidos en el rango de fechas seleccionado
    const topProductosRaw = await this.ventaRepo
      .createQueryBuilder('venta')
      .innerJoin('venta.detalles', 'detalle')
      .innerJoin('detalle.producto', 'producto')
      .innerJoin('producto.categoria', 'categoria') // Unimos con categoría para el Front
      .select('producto.id', 'productoId')
      .addSelect('producto.nombre', 'producto')
      .addSelect('categoria.nombre', 'categoria')
      .addSelect('SUM(detalle.cantidad)', 'cantidad')
      .addSelect('SUM(detalle.cantidad * detalle.precioUnitario)', 'total')
      .where('venta.fecha BETWEEN :inicio AND :fin', { inicio: inicioFiltro, fin: finFiltro })
      .groupBy('producto.id')
      .addGroupBy('producto.nombre')
      .addGroupBy('categoria.nombre')
      .orderBy('SUM(detalle.cantidad)', 'DESC')
      .limit(5)
      .getRawMany();

    // 3. Ventas por Personal (Asumiendo relación venta.usuario)
    const ventasPersonal = await this.ventaRepo
      .createQueryBuilder('venta')
      .innerJoin('venta.usuario', 'u')
      .leftJoin('venta.detalles', 'detalle')
      .select('u.id', 'usuarioId')
      .addSelect('u.nombre', 'nombre') // Cambiar por la propiedad de tu entidad Usuario (ej. username o nombre)
      .addSelect('COUNT(DISTINCT venta.id)', 'ordenes')
      .addSelect('SUM(detalle.cantidad * detalle.precioUnitario)', 'totalRecaudado')
      .where('venta.fecha BETWEEN :inicio AND :fin', { inicio: inicioFiltro, fin: finFiltro })
      .groupBy('u.id')
      .addGroupBy('u.nombre')
      .orderBy('SUM(detalle.cantidad * detalle.precioUnitario)', 'DESC')
      .getRawMany();

    // 4. Insumos Críticos (Ejemplo analítico directo desde Stock bajo de Insumos)
    // Nota: Al no inyectar el repositorio de Insumos aquí, podemos usar una consulta nativa simplificada o queryBuilder cruzado.
    const insumosCriticos = await this.ventaRepo.manager.query(`
      SELECT id, nombre, cantidad_disponible AS "stockActual", 10 AS "stockMinimo",
             ROUND((cantidad_disponible::numeric / 10::numeric) * 100, 2) AS "porcentaje"
      FROM insumos
      WHERE cantidad_disponible <= 10
      LIMIT 4
    `);

    // Retornamos la estructura exacta que el Frontend espera mapear
    return {
      kpis: {
        totalVentas,
        totalOrdenes,
        ticketPromedio: totalOrdenes ? totalVentas / totalOrdenes : 0,
      },
      topProductos: topProductosRaw.map(p => ({
        productoId: parseInt(p.productoId),
        producto: p.producto,
        categoria: p.categoria,
        cantidad: parseInt(p.cantidad),
        total: parseFloat(p.total)
      })),
      insumosCriticos: insumosCriticos.map(i => ({
        id: i.id,
        nombre: i.nombre,
        stockActual: parseFloat(i.stockActual),
        stockMinimo: parseFloat(i.stockMinimo),
        porcentaje: parseFloat(i.porcentaje)
      })),
      ventasPersonal: ventasPersonal.map(v => ({
        usuarioId: parseInt(v.usuarioId),
        nombre: v.nombre,
        ordenes: parseInt(v.ordenes),
        totalRecaudado: parseFloat(v.totalRecaudado),
        avatar: v.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() // Genera las iniciales dinámicamente ("CM")
      }))
    };
  }

  // 🧾 LÓGICA PARA EL MODAL "CERRAR CAJA" (Informativo del día de hoy en curso)
  async obtenerResumenCierreCaja() {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.setHours(0, 0, 0, 0));
    const finHoy = new Date(hoy.setHours(23, 59, 59, 999));

    const productosVendidosHoy = await this.ventaRepo
      .createQueryBuilder('venta')
      .innerJoin('venta.detalles', 'detalle')
      .innerJoin('detalle.producto', 'producto')
      .select('producto.nombre', 'producto')
      .addSelect('SUM(detalle.cantidad)', 'cantidadTotal')
      .addSelect('SUM(detalle.cantidad * detalle.precioUnitario)', 'subtotalRecaudado')
      .where('venta.fecha BETWEEN :inicio AND :fin', { inicio: inicioHoy, fin: finHoy })
      .groupBy('producto.nombre')
      .orderBy('SUM(detalle.cantidad)', 'DESC')
      .getRawMany();

    const granTotal = productosVendidosHoy.reduce(
      (acc, curr) => acc + parseFloat(curr.subtotalRecaudado),
      0,
    );
    return {
      fechaReporte: new Date().toLocaleDateString(),
      totalCaja: granTotal,
      productos: productosVendidosHoy.map(p => ({
        producto: p.producto,
        cantidadTotal: parseInt(p.cantidadTotal),
        subtotalRecaudado: parseFloat(p.subtotalRecaudado)
      }))
    };
  }
}