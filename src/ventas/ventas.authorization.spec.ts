
import {
    ExecutionContext,
    INestApplication,
    UnauthorizedException,
    ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');

import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('Ventas - autorización por roles', () => {
    let app: INestApplication;

    const ventasMock = {
        obtenerTodas: jest.fn().mockResolvedValue([]),
        eliminarVenta: jest.fn().mockResolvedValue(undefined),
        registrarVenta: jest.fn().mockResolvedValue({
            success: true,
            ventaId: 123,
        }),
    };


    it('registra la venta usando exclusivamente el usuario autenticado', async () => {
        ventasMock.registrarVenta.mockClear();

        const payload = {
            productos: [
                {
                    productoId: 3,
                    cantidad: 1,
                    observacion: '',
                },
            ],
        };

        await request(app.getHttpServer())
            .post('/ventas')
            .set('x-test-role', 'cajero')
            .send(payload)
            .expect(201);

        expect(ventasMock.registrarVenta).toHaveBeenCalledWith(
            expect.objectContaining({
                usuarioId: 1,
                productos: expect.any(Array),
            }),
        );
    });

    it('rechaza precioUnitario enviado por React', async () => {
        ventasMock.registrarVenta.mockClear();

        const ventaManipulada = {
            productos: [
                {
                    productoId: 3,
                    cantidad: 1,
                    precioUnitario: 0.01,
                    observacion: '',
                },
            ],
        };

        await request(app.getHttpServer())
            .post('/ventas')
            .set('x-test-role', 'cajero')
            .send(ventaManipulada)
            .expect(400);

        expect(
            ventasMock.registrarVenta,
        ).not.toHaveBeenCalled();
    });



    it('rechaza usuarioId enviado por React', async () => {
        ventasMock.registrarVenta.mockClear();

        const ventaManipulada = {
            usuarioId: 999,
            productos: [
                {
                    productoId: 3,
                    cantidad: 1,
                    precioUnitario: 1.5,
                    observacion: '',
                },
            ],
        };

        await request(app.getHttpServer())
            .post('/ventas')
            .set('x-test-role', 'cajero')
            .send(ventaManipulada)
            .expect(400);

        // No debe registrarse ninguna venta.
        expect(ventasMock.registrarVenta).not.toHaveBeenCalled();
    });


    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [VentasController],
            providers: [
                {
                    provide: VentasService,
                    useValue: ventasMock,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    const rol = req.headers['x-test-role'];

                    if (!rol || Array.isArray(rol)) {
                        throw new UnauthorizedException();
                    }

                    req.user = { id: 1, rol };
                    return true;
                },
            })

            .compile();

        // 1. Crear la aplicación NestJS
        app = moduleRef.createNestApplication();

        // 2. Configurar las validaciones
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        // 3. Inicializar la aplicación
        await app.init();

    });

    afterAll(async () => {
        await app.close();
    });

    it('rechaza eliminar ventas sin autenticación', async () => {
        await request(app.getHttpServer())
            .delete('/ventas/1')
            .expect(401);
    });

    it('impide al cajero eliminar ventas', async () => {
        await request(app.getHttpServer())
            .delete('/ventas/1')
            .set('x-test-role', 'cajero')
            .expect(403);
    });

    it('permite al administrador eliminar ventas', async () => {
        await request(app.getHttpServer())
            .delete('/ventas/1')
            .set('x-test-role', 'admin')
            .expect(200);
    });


    it('permite al cajero consultar ventas', async () => {
        await request(app.getHttpServer())
            .get('/ventas')
            .set('x-test-role', 'cajero')
            .expect(200);
    });
});