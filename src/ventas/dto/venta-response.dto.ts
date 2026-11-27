
import { Venta } from '../ventas.entity';

export function toVentaResponseDto(venta: Venta) {
  return {
    id: venta.id,
    fecha: venta.fecha,

    // Solo información pública del vendedor
    usuario: venta.usuario
      ? {
          id: venta.usuario.id,
          nombre: venta.usuario.nombre,
        }
      : null,

    // Conservar los detalles necesarios para React
    ...(venta.detalles !== undefined
      ? {
          detalles: venta.detalles.map((detalle) => ({
            id: detalle.id,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            observacion: detalle.observacion,

            producto: {
              id: detalle.producto.id,
              nombre: detalle.producto.nombre,
              precio: detalle.producto.precio,
              imagen: detalle.producto.imagen,

              categoria: detalle.producto.categoria
                ? {
                    id: detalle.producto.categoria.id,
                    nombre: detalle.producto.categoria.nombre,
                  }
                : null,
            },
          })),
        }
      : {}),
  };
}

export type VentaResponseDto = ReturnType<
  typeof toVentaResponseDto
>;
