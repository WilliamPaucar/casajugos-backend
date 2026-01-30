export class DashboardResponseDto {
  kpis: {
    totalVentas: number;
    totalOrdenes: number;
    ticketPromedio: number;
  };

  ventasSemanales: {
    dia: string;
    total: number;
  }[];

  ventasMensuales: {
    mes: string;
    total: number;
  }[];

  topProductos: {
    productoId: number;
    producto: string;
    categoria: string;
    total: number;
    cantidad: number;
  }[];

  topCategorias: {
    categoria: string;
    total: number;
  }[];
}
