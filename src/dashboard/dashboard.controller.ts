import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard') // Ruta base: /dashboard
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Consumirá: GET http://localhost:3000/dashboard/metricas?from=YYYY-MM-DD&to=YYYY-MM-DD
  @Get('metricas')
  async obtenerMetricas(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return await this.dashboardService.obtenerMetricasDashboard(from, to);
  }

  // Consumirá: GET http://localhost:3000/dashboard/cierre-caja
  @Get('cierre-caja')
  async obtenerCierreCaja() {
    return await this.dashboardService.obtenerResumenCierreCaja();
  }
}