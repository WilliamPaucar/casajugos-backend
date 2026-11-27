
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { UsuariosRepository } from './usuarios.repositoy';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { toUsuarioDto } from './utils/usuario.mapper';
import { Usuario } from './usuario.entity';

describe('Seguridad de Usuarios', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const testSecret = 'clave-exclusiva-para-pruebas-jest';

  const usuario = {
    id: 1,
    nombre: 'Usuario Prueba',
    email: 'prueba@example.com',
    password_hash: 'hash-de-prueba',
    activo: true,
    rol: { id: 1, nombre: 'admin' },
  } as Usuario;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: testSecret }),
      ],
      controllers: [UsuariosController],

      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? testSecret : undefined,
          },
        },
        {
          provide: UsuariosService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              toUsuarioDto(usuario),
            ]),
          },
        },
        {
          provide: UsuariosRepository,
          useValue: {
            findById: jest.fn().mockImplementation(async (id: number) => {
              if (id === 1) return usuario;

              if (id === 2) {
                return {
                  ...usuario,
                  id: 2,
                  email: 'cajero@example.com',
                  rol: { id: 2, nombre: 'cajero' },
                };
              }

              return null;
            }),
          },
        },
      ],

    }).compile();



    app = module.createNestApplication();
    jwtService = module.get(JwtService);

    await app.init();
  });


  afterAll(async () => {
    await app?.close();
  });

  it('rechaza solicitudes sin token JWT', async () => {
    await request(app.getHttpServer())
      .get('/usuarios')
      .expect(401);
  });

  it('permite solicitudes con JWT válido', async () => {
    const token = jwtService.sign({
      sub: 1,
      email: usuario.email,
      rol: 'admin',
    });

    const response = await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
  });
  it('rechaza usuarios con rol cajero', async () => {
    const token = jwtService.sign({
      sub: 2,
      email: 'cajero@example.com',
      rol: 'cajero',
    });

    await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('no expone el hash de contraseña', () => {
    const resultado = toUsuarioDto(usuario);

    expect(resultado).not.toHaveProperty('password_hash');
  });
});
