
import { DataSource, Repository } from 'typeorm';

import { VentasService } from './ventas.service';
import { Venta } from './ventas.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Producto } from '../productos/producto.entity';
import { DetalleVentaService } from '../detalle-ventas/detalle-ventas.service';
import { VentasGateway } from './gateway/ventas.gateway';
import { NotFoundException } from '@nestjs/common';
describe('VentasService - seguridad de precios', () => {

  it('registra el precio autorizado del catálogo', async () => {
    const manager = {
      findOne: jest.fn().mockImplementation(async (entidad) => {
        if (entidad === Usuario) {
          return { id: 1, nombre: 'Cajero Prueba' };
        }

        if (entidad === Producto) {
          return {
            id: 3,
            nombre: 'Jugo natural',
            precio: '2.25',
          };
        }

        return null;
      }),

      save: jest.fn().mockResolvedValue({
        id: 10,
        fecha: new Date('2026-01-01T12:00:00Z'),
      }),

      query: jest.fn().mockResolvedValue([]),
      decrement: jest.fn(),
    };

    const queryRunner = {
      manager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    const dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    const detalleService = {
      crear: jest.fn().mockResolvedValue({ id: 100 }),
    };

    const ventasGateway = {
      emitirVentaCreada: jest.fn(),
    };

    const service = new VentasService(
      {} as Repository<Venta>,
      ventasGateway as unknown as VentasGateway,
      {} as Repository<Usuario>,
      dataSource as unknown as DataSource,
      detalleService as unknown as DetalleVentaService,
    );

    await service.registrarVenta({
      usuarioId: 1,
      productos: [
        {
          productoId: 3,
          cantidad: 1,
          observacion: '',
        },
      ],
    });

    // Debe registrar el precio autorizado: $2.25
    expect(detalleService.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        ventaId: 10,
        productoId: 3,
        cantidad: 1,
        precioUnitario: 2.25,
      }),
      manager,
    );

    // El producto debe consultarse dentro de la transacción.
    expect(manager.findOne).toHaveBeenCalledWith(
      Producto,
      { where: { id: 3 } },
    );

    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('revierte la venta si el producto no existe y conserva el error 404', async () => {
    const manager = {
      findOne: jest.fn().mockImplementation(async (entidad) => {
        if (entidad === Usuario) {
          return {
            id: 1,
            nombre: 'Cajero Prueba',
          };
        }

        if (entidad === Producto) {
          return null; // Producto inexistente
        }

        return null;
      }),

      save: jest.fn().mockResolvedValue({
        id: 10,
        fecha: new Date(),
      }),

      query: jest.fn(),
      decrement: jest.fn(),
    };

    const queryRunner = {
      manager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    const dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    const detalleService = {
      crear: jest.fn(),
    };

    const gateway = {
      emitirVentaCreada: jest.fn(),
    };

    const service = new VentasService(
      {} as Repository<Venta>,
      gateway as unknown as VentasGateway,
      {} as Repository<Usuario>,
      dataSource as unknown as DataSource,
      detalleService as unknown as DetalleVentaService,
    );

    await expect(
      service.registrarVenta({
        usuarioId: 1,
        productos: [
          {
            productoId: 999,
            cantidad: 1,
            observacion: '',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    // La transacción debe revertirse.
    expect(queryRunner.rollbackTransaction)
      .toHaveBeenCalledTimes(1);

    // No debe confirmarse la venta.
    expect(queryRunner.commitTransaction)
      .not.toHaveBeenCalled();

    // No debe registrarse ningún detalle.
    expect(detalleService.crear)
      .not.toHaveBeenCalled();

    // No debe notificarse una venta fallida.
    expect(gateway.emitirVentaCreada)
      .not.toHaveBeenCalled();

    // Los recursos deben liberarse.
    expect(queryRunner.release)
      .toHaveBeenCalledTimes(1);
  });

  it('mantiene la venta confirmada aunque falle la notificación WebSocket', async () => {
    const manager = {
      findOne: jest.fn().mockImplementation(async (entidad) => {
        if (entidad === Usuario) {
          return { id: 1, nombre: 'Cajero Prueba' };
        }

        if (entidad === Producto) {
          return {
            id: 3,
            nombre: 'Jugo natural',
            precio: '2.25',
          };
        }

        return null;
      }),

      save: jest.fn().mockResolvedValue({
        id: 10,
        fecha: new Date('2026-01-01T12:00:00Z'),
      }),

      query: jest.fn().mockResolvedValue([]),
      decrement: jest.fn(),
    };

    const queryRunner = {
      manager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    const dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    const detalleService = {
      crear: jest.fn().mockResolvedValue({ id: 100 }),
    };

    // Simulamos un fallo al emitir la notificación.
    const gateway = {
      emitirVentaCreada: jest.fn().mockImplementation(() => {
        throw new Error('WebSocket no disponible');
      }),
    };

    const service = new VentasService(
      {} as Repository<Venta>,
      gateway as unknown as VentasGateway,
      {} as Repository<Usuario>,
      dataSource as unknown as DataSource,
      detalleService as unknown as DetalleVentaService,
    );

    const resultado = await service.registrarVenta({
      usuarioId: 1,
      productos: [
        {
          productoId: 3,
          cantidad: 1,
          observacion: '',
        },
      ],
    });

    // La venta debe considerarse exitosa.
    expect(resultado).toEqual({
      success: true,
      ventaId: 10,
    });

    // PostgreSQL ya confirmó la transacción.
    expect(queryRunner.commitTransaction)
      .toHaveBeenCalledTimes(1);

    // No debemos intentar revertir una venta confirmada.
    expect(queryRunner.rollbackTransaction)
      .not.toHaveBeenCalled();

    // La notificación sí fue intentada.
    expect(gateway.emitirVentaCreada)
      .toHaveBeenCalledTimes(1);

    // Los recursos deben liberarse.
    expect(queryRunner.release)
      .toHaveBeenCalledTimes(1);
  });


});
