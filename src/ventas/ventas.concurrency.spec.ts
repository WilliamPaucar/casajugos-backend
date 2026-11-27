import { ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { VentasService } from './ventas.service';
import { Venta } from './ventas.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Rol } from '../roles/rol.entity';
import { Producto } from '../productos/producto.entity';
import { Categoria } from '../categorias/categoria.entity';
import { Insumo } from '../insumos/insumo.entity';
import { ProductoInsumo } from '../productos-insumos/producto-insumo.entity';
import { DetalleVenta } from '../detalle-ventas/detalle-venta.entity';
import { DetalleVentaService } from '../detalle-ventas/detalle-ventas.service';
import { VentasGateway } from './gateway/ventas.gateway';

jest.setTimeout(60000);

// Esta suite solo se ejecuta explícitamente contra PostgreSQL de pruebas.
const ejecutar = process.env.RUN_PG_CONCURRENCY === '1'
    ? describe
    : describe.skip;

ejecutar('Ventas - concurrencia PostgreSQL real', () => {
    let db: DataSource;

    beforeAll(async () => {
        const password = process.env.PG_TEST_PASSWORD;

        if (!password) {
            throw new Error('Falta PG_TEST_PASSWORD');
        }

        db = new DataSource({
            type: 'postgres',
            host: 'host.docker.internal',
            port: 55433,
            username: 'casajugos_test',
            password,
            database: 'casajugos_test',
            entities: [
                Rol,
                Usuario,
                Categoria,
                Producto,
                Insumo,
                ProductoInsumo,
                Venta,
                DetalleVenta,
            ],
            synchronize: false,
            logging: false,
        });

        await db.initialize();

        // Verificar la identidad de la base antes de crear o borrar datos.
        const [conexion] = await db.query(`
      SELECT
        current_database() AS database,
        current_user AS account
    `);

        if (
            conexion.database !== 'casajugos_test' ||
            conexion.account !== 'casajugos_test'
        ) {
            throw new Error('Conexión fuera de la base de pruebas');
        }

        // Solo crea/actualiza las tablas dentro de casajugos_test.
        await db.synchronize();
    });

    beforeEach(async () => {
        // Cada prueba parte de los mismos datos iniciales.
        // Este TRUNCATE afecta exclusivamente a casajugos_test.
        await db.query(`
      TRUNCATE TABLE
        detalle_venta, producto_insumo, ventas,
        productos, categorias, usuarios, roles, insumos
      RESTART IDENTITY CASCADE
    `);

        await db.query(`
      INSERT INTO roles (id, nombre)
      VALUES (1, 'cajero')
    `);

        await db.query(`
      INSERT INTO usuarios
        (id, nombre, email, password_hash, rol_id, activo)
      VALUES
        (1, 'Cajero A', 'cajeroa@test.local', 'test', 1, true),
        (2, 'Cajero B', 'cajerob@test.local', 'test', 1, true)
    `);

        await db.query(`
      INSERT INTO categorias (id, nombre)
      VALUES (1, 'Jugos')
    `);

        await db.query(`
      INSERT INTO productos
        (id, nombre, precio, categoria_id)
      VALUES (3, 'Jugo de naranja', 2.25, 1)
    `);

        await db.query(`
      INSERT INTO insumos
        (id, nombre, cantidad_disponible, unidad)
      VALUES (7, 'Naranja', 1, 'unidad')
    `);

        await db.query(`
      INSERT INTO producto_insumo
        (producto_id, insumo_id, cantidad_usada)
      VALUES (3, 7, 1)
    `);
    });

    afterAll(async () => {
        if (db?.isInitialized) {
            await db.destroy();
        }
    });

    it('permite una sola venta cuando dos cajeros compiten por el último insumo', async () => {
        const detalleService = new DetalleVentaService(
            db.getRepository(DetalleVenta),
            db.getRepository(Venta),
            db.getRepository(Producto),
        );

        const gateway = {
            emitirVentaCreada: jest.fn(),
        };

        const ventasService = new VentasService(
            db.getRepository(Venta),
            gateway as unknown as VentasGateway,
            db.getRepository(Usuario),
            db,
            detalleService,
        );

        const productos = [
            { productoId: 3, cantidad: 1, observacion: '' },
        ];

        const resultados = await Promise.allSettled([
            ventasService.registrarVenta({ usuarioId: 1, productos }),
            ventasService.registrarVenta({ usuarioId: 2, productos }),
        ]);

        const exitosas = resultados.filter((r) => r.status === 'fulfilled');
        const rechazadas = resultados.filter((r) => r.status === 'rejected');

        expect(exitosas).toHaveLength(1);
        expect(rechazadas).toHaveLength(1);

        const rechazada = rechazadas[0];
        if (rechazada.status === 'rejected') {
            expect(rechazada.reason).toBeInstanceOf(ConflictException);
        }

        const [inventario] = await db.query(`
      SELECT cantidad_disponible FROM insumos WHERE id = 7
    `);
        const [ventas] = await db.query(`
      SELECT COUNT(*)::int AS total FROM ventas
    `);
        const [detalles] = await db.query(`
      SELECT COUNT(*)::int AS total FROM detalle_venta
    `);

        expect(Number(inventario.cantidad_disponible)).toBe(0);
        expect(ventas.total).toBe(1);
        expect(detalles.total).toBe(1);
        expect(gateway.emitirVentaCreada).toHaveBeenCalledTimes(1);
    });

    it('evita sobreventa con dos insumos compartidos', async () => {
        // beforeEach ya dejó las ventas vacías y el insumo 7 con una unidad.
        await db.query(`
      INSERT INTO insumos (id, nombre, cantidad_disponible, unidad)
      VALUES (8, 'Fruta de prueba', 1, 'unidad')
    `);

        await db.query(`
      INSERT INTO productos (id, nombre, precio, categoria_id)
      VALUES (4, 'Jugo mixto', 2.50, 1)
    `);

        await db.query(`
      INSERT INTO producto_insumo
        (producto_id, insumo_id, cantidad_usada)
      VALUES
        (3, 8, 1),
        (4, 8, 1),
        (4, 7, 1)
    `);

        const detalleService = new DetalleVentaService(
            db.getRepository(DetalleVenta),
            db.getRepository(Venta),
            db.getRepository(Producto),
        );

        const gateway = {
            emitirVentaCreada: jest.fn(),
        };

        const ventasService = new VentasService(
            db.getRepository(Venta),
            gateway as unknown as VentasGateway,
            db.getRepository(Usuario),
            db,
            detalleService,
        );

        const resultados = await Promise.allSettled([
            ventasService.registrarVenta({
                usuarioId: 1,
                productos: [
                    { productoId: 3, cantidad: 1, observacion: '' },
                ],
            }),
            ventasService.registrarVenta({
                usuarioId: 2,
                productos: [
                    { productoId: 4, cantidad: 1, observacion: '' },
                ],
            }),
        ]);

        const exitosas = resultados.filter((r) => r.status === 'fulfilled');
        const rechazadas = resultados.filter((r) => r.status === 'rejected');

        expect(exitosas).toHaveLength(1);
        expect(rechazadas).toHaveLength(1);

        const rechazada = rechazadas[0];
        if (rechazada.status === 'rejected') {
            expect(rechazada.reason).toBeInstanceOf(ConflictException);
        }

        const insumos = await db.query(`
      SELECT id, cantidad_disponible
      FROM insumos
      WHERE id IN (7, 8)
      ORDER BY id
    `);
        const [ventas] = await db.query(`
      SELECT COUNT(*)::int AS total FROM ventas
    `);
        const [detalles] = await db.query(`
      SELECT COUNT(*)::int AS total FROM detalle_venta
    `);

        expect(insumos).toHaveLength(2);
        expect(
            insumos.map((insumo: { cantidad_disponible: string }) =>
                Number(insumo.cantidad_disponible),
            ),
        ).toEqual([0, 0]);
        expect(ventas.total).toBe(1);
        expect(detalles.total).toBe(1);
        expect(gateway.emitirVentaCreada).toHaveBeenCalledTimes(1);
    });

    it('procesa 10 ventas concurrentes sin superar el inventario', async () => {
        // beforeEach ya preparó el escenario inicial.
        // Para esta prueba disponemos de 3 unidades.
        await db.query(`
    UPDATE insumos
    SET cantidad_disponible = 3
    WHERE id = 7
  `);

        const detalleService = new DetalleVentaService(
            db.getRepository(DetalleVenta),
            db.getRepository(Venta),
            db.getRepository(Producto),
        );

        const gateway = {
            emitirVentaCreada: jest.fn(),
        };

        const ventasService = new VentasService(
            db.getRepository(Venta),
            gateway as unknown as VentasGateway,
            db.getRepository(Usuario),
            db,
            detalleService,
        );

        const resultados = await Promise.allSettled(
            Array.from({ length: 10 }, (_, indice) =>
                ventasService.registrarVenta({
                    usuarioId: (indice % 2) + 1,
                    productos: [
                        { productoId: 3, cantidad: 1, observacion: '' },
                    ],
                }),
            ),
        );

        const exitosas = resultados.filter(
            resultado => resultado.status === 'fulfilled',
        );

        const rechazadas = resultados.filter(
            resultado => resultado.status === 'rejected',
        );

        expect(exitosas).toHaveLength(3);
        expect(rechazadas).toHaveLength(7);

        for (const resultado of rechazadas) {
            if (resultado.status === 'rejected') {
                expect(resultado.reason)
                    .toBeInstanceOf(ConflictException);
            }
        }

        const [inventario] = await db.query(`
    SELECT cantidad_disponible
    FROM insumos WHERE id = 7
  `);

        const [ventas] = await db.query(`
    SELECT COUNT(*)::int AS total FROM ventas
  `);

        const [detalles] = await db.query(`
    SELECT COUNT(*)::int AS total FROM detalle_venta
  `);

        expect(Number(inventario.cantidad_disponible)).toBe(0);
        expect(ventas.total).toBe(3);
        expect(detalles.total).toBe(3);

        expect(gateway.emitirVentaCreada)
            .toHaveBeenCalledTimes(3);
    });


    it('evita interbloqueos con productos en orden inverso', async () => {
        // Preparación: ambos productos necesitan los insumos 7 y 8.
        await db.query(`
    INSERT INTO insumos
      (id, nombre, cantidad_disponible, unidad)
    VALUES (8, 'Fruta de prueba', 2, 'unidad')
  `);

        await db.query(`
    INSERT INTO productos (id, nombre, precio, categoria_id)
    VALUES (4, 'Jugo mixto', 2.50, 1)
  `);

        await db.query(`
    INSERT INTO producto_insumo
      (producto_id, insumo_id, cantidad_usada)
    VALUES
      (3, 8, 1),
      (4, 8, 1),
      (4, 7, 1)
  `);

        const detalleService = new DetalleVentaService(
            db.getRepository(DetalleVenta),
            db.getRepository(Venta),
            db.getRepository(Producto),
        );

        const gateway = {
            emitirVentaCreada: jest.fn(),
        };

        const service = new VentasService(
            db.getRepository(Venta),
            gateway as unknown as VentasGateway,
            db.getRepository(Usuario),
            db,
            detalleService,
        );

        // Repetir el escenario diez veces.
        for (let ronda = 1; ronda <= 10; ronda++) {
            await db.query('DELETE FROM detalle_venta');
            await db.query('DELETE FROM ventas');

            // Cada venta necesita dos unidades de cada insumo.
            // Hay existencias suficientes para una sola venta.
            await db.query(`
      UPDATE insumos
      SET cantidad_disponible = 2
      WHERE id IN (7, 8)
    `);

            const resultados = await Promise.allSettled([
                service.registrarVenta({
                    usuarioId: 1,
                    productos: [
                        { productoId: 3, cantidad: 1, observacion: '' },
                        { productoId: 4, cantidad: 1, observacion: '' },
                    ],
                }),

                service.registrarVenta({
                    usuarioId: 2,
                    productos: [
                        { productoId: 4, cantidad: 1, observacion: '' },
                        { productoId: 3, cantidad: 1, observacion: '' },
                    ],
                }),
            ]);

            const exitosas = resultados.filter(
                r => r.status === 'fulfilled',
            );

            const rechazadas = resultados.filter(
                r => r.status === 'rejected',
            );

            expect(exitosas).toHaveLength(1);
            expect(rechazadas).toHaveLength(1);

            if (rechazadas[0].status === 'rejected') {
                expect(rechazadas[0].reason)
                    .toBeInstanceOf(ConflictException);
            }

            const insumos = await db.query(`
      SELECT id, cantidad_disponible
      FROM insumos
      WHERE id IN (7, 8)
      ORDER BY id
    `);

            expect(
                insumos.map(i => Number(i.cantidad_disponible)),
            ).toEqual([0, 0]);

            const [ventas] = await db.query(`
      SELECT COUNT(*)::int AS total FROM ventas
    `);

            const [detalles] = await db.query(`
      SELECT COUNT(*)::int AS total FROM detalle_venta
    `);

            expect(ventas.total).toBe(1);
            expect(detalles.total).toBe(2);
        }

        expect(gateway.emitirVentaCreada)
            .toHaveBeenCalledTimes(10);
    });

});
