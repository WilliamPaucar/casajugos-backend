
import { Repository, DataSource } from 'typeorm';
import { VentasService } from './ventas.service';
import { Venta } from './ventas.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { VentasGateway } from './gateway/ventas.gateway';
import { DetalleVentaService } from '../detalle-ventas/detalle-ventas.service';
import { UpdateVentaDto } from './dto/update-ventas.dto';

describe('VentasService - privacidad de datos', () => {
  let service: VentasService;

  const venta = {
    id: 10,
    fecha: new Date('2026-01-01T12:00:00Z'),
    usuario: {
      id: 1,
      nombre: 'Cajero Prueba',
      email: 'cajero@example.com',
      password_hash: 'HASH_PRIVADO',
      refreshToken: 'TOKEN_PRIVADO',
    },
    detalles: [
      {
        id: 5,
        cantidad: 2,
        producto: {
          id: 3,
          nombre: 'Jugo natural',
          categoria: { id: 1, nombre: 'Jugos' },
        },
      },
    ],
  } as unknown as Venta;

  beforeEach(() => {
    const ventasRepo = {
      find: jest.fn().mockResolvedValue([venta]),
      findOne: jest.fn().mockResolvedValue(venta),
      save: jest.fn().mockResolvedValue(venta),
    };

    service = new VentasService(
      ventasRepo as unknown as Repository<Venta>,
      {} as VentasGateway,
      {} as Repository<Usuario>,
      {} as DataSource,
      {} as DetalleVentaService,
    );
  });

  const verificarPrivacidad = (respuesta: unknown) => {
    const contenido = JSON.stringify(respuesta);

    expect(contenido).not.toContain('password_hash');
    expect(contenido).not.toContain('refreshToken');
  };

  it('no expone datos sensibles al listar ventas', async () => {
    const resultado = await service.obtenerTodas();

    verificarPrivacidad(resultado);

    expect(resultado[0].usuario).toEqual({
      id: 1,
      nombre: 'Cajero Prueba',
    });

    expect(resultado[0].detalles).toHaveLength(1);
  });

  it('no expone datos sensibles al consultar una venta', async () => {
    const resultado = await service.obtenerPorId(10);

    verificarPrivacidad(resultado);
  });

  it('no expone datos sensibles al actualizar una venta', async () => {
    const resultado = await service.actualizarVenta(
      10,
      {} as UpdateVentaDto,
    );

    verificarPrivacidad(resultado);
  });
});
