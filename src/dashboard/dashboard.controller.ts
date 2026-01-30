import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@Query() query: DashboardQueryDto) {
    const from = new Date(query.from);
    const to = new Date(query.to);
    const top = query.top ?? 5;

    const [
      kpis,
      ventasSemanales,
      ventasMensuales,
      topProductos,
      topCategorias,
    ] = await Promise.all([
      this.dashboardService.getKpis(from, to),
      this.dashboardService.getVentasSemanales(from, to),
      this.dashboardService.getVentasMensuales(from, to),
      this.dashboardService.getTopProductos(from, to, top),
      this.dashboardService.getTopCategorias(from, to),
    ]);

    return {
      kpis,
      ventasSemanales,
      ventasMensuales,
      topProductos,
      topCategorias,
    };
  }
}
