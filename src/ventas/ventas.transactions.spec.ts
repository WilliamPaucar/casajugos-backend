
import { ConflictException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { VentasService } from './ventas.service';
import { Venta } from './ventas.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Producto } from '../productos/producto.entity';
import { VentasGateway } from './gateway/ventas.gateway';
import { DetalleVentaService } from '../detalle-ventas/detalle-ventas.service';

describe('VentasService - integridad transaccional', () => {
  it('revierte la venta cuando no hay suficientes insumos', async () => {
    const manager = {
      findOne: jest.fn().mockImplementation(async (entidad) => {
        if (entidad === Usuario) {
          return {
            id: 1,
            nombre: 'Cajero Prueba',
          };
        }

        if (entidad === Producto) {
          return {
            id: 3,
            nombre: 'Jugo de naranja',
            precio: '2.25',
          };
        }

        return null;
      }),

      save: jest.fn().mockResolvedValue({
        id: 10,
        fecha: new Date(),
      }),

      // Solo existe 1 unidad del insumo.
      // La venta necesita 2 unidades.

      query: jest.fn().mockImplementation(async (sql: string) => {
        // Primera consulta: obtener los insumos de la receta.
        if (/FROM\s+producto_insumo\b/i.test(sql)) {
          return [
            {
              insumo_id: 7,
              cantidad_usada: '1',
            },
          ];
        }

        // Segunda consulta: consultar y bloquear el inventario.
        if (/FROM\s+insumos\s+i\b/i.test(sql)) {
          return [
            {
              id: 7,
              cantidad_disponible: '1',
            },
          ];
        }

        return [];
      }),


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
            productoId: 3,
            cantidad: 2,
            observacion: '',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    // La transacción debe revertirse.
    expect(queryRunner.rollbackTransaction)
      .toHaveBeenCalledTimes(1);

    // No debe confirmarse la venta.
    expect(queryRunner.commitTransaction)
      .not.toHaveBeenCalled();

    // No debe descontarse inventario insuficiente.
    expect(manager.decrement)
      .not.toHaveBeenCalled();

    // No notificar una venta que no se confirmó.
    expect(gateway.emitirVentaCreada)
      .not.toHaveBeenCalled();

    // Liberar siempre la conexión.
    expect(queryRunner.release)
      .toHaveBeenCalledTimes(1);


    // La consulta debe bloquear las filas de insumos.
    // Esto ayuda a evitar que dos cajeros utilicen
    // simultáneamente las mismas existencias.
    expect(manager.query).toHaveBeenCalledWith(
      expect.stringMatching(
        /\bFOR\s+UPDATE\s+OF\s+i\b/i,
      ),
      [7],
    );

  });

  it('agrupa los insumos compartidos antes de descontar inventario', async () => {
    const manager = {
      findOne: jest.fn().mockImplementation(async (entidad) => {
        if (entidad === Usuario) {
          return {
            id: 1,
            nombre: 'Cajero Prueba',
          };
        }

        if (entidad === Producto) {
          return {
            id: 3,
            precio: '2.25',
          };
        }

        return null;
      }),

      save: jest.fn().mockResolvedValue({
        id: 10,
        fecha: new Date(),
      }),

      // Ambos productos utilizan el mismo insumo.

      query: jest.fn().mockImplementation(async (sql: string) => {
        // Consultar la receta de cada producto.
        if (/FROM\s+producto_insumo\b/i.test(sql)) {
          return [
            {
              insumo_id: 7,
              cantidad_usada: '1',
            },
          ];
        }

        // Consultar la existencia del insumo con bloqueo.
        if (/FROM\s+insumos\s+i\b/i.test(sql)) {
          return [
            {
              id: 7,
              cantidad_disponible: '10',
            },
          ];
        }

        return [];
      }),


      decrement: jest.fn().mockResolvedValue(undefined),
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

    await service.registrarVenta({
      usuarioId: 1,
      productos: [
        {
          productoId: 3,
          cantidad: 2,
          observacion: '',
        },
        {
          productoId: 4,
          cantidad: 1,
          observacion: '',
        },
      ],
    });

    // El insumo 7 se utiliza en ambos productos.
    // Deben descontarse 3 unidades en una operación.
    expect(manager.decrement).toHaveBeenCalledTimes(1);

    expect(manager.decrement).toHaveBeenCalledWith(
      'insumos',
      { id: 7 },
      'cantidad_disponible',
      3,
    );

    expect(queryRunner.commitTransaction)
      .toHaveBeenCalledTimes(1);

    expect(queryRunner.rollbackTransaction)
      .not.toHaveBeenCalled();

    expect(queryRunner.release)
      .toHaveBeenCalledTimes(1);
  });

});
