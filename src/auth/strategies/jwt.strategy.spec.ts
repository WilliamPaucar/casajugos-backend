
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UsuariosRepository } from '../../usuarios/usuarios.repositoy';

describe('JwtStrategy - validacion de usuarios', () => {
  let strategy: JwtStrategy;

  const usuariosRepo = {
    findById: jest.fn(),
  };

  const payload = {
    sub: 1,
    email: 'usuario@example.com',
    rol: 'admin',
  };

  beforeEach(async () => {
    usuariosRepo.findById.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? 'secret-solo-jest' : undefined,
          },
        },
        {
          provide: UsuariosRepository,
          useValue: usuariosRepo,
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it('rechaza usuarios desactivados', async () => {
    usuariosRepo.findById.mockResolvedValue({
      id: 1,
      activo: false,
      rol: { nombre: 'admin' },
    });

    await expect(
      strategy.validate(payload),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('utiliza el rol actual de PostgreSQL', async () => {
    usuariosRepo.findById.mockResolvedValue({
      id: 1,
      email: payload.email,
      activo: true,
      rol: { nombre: 'cajero' },
    });

    const resultado = await strategy.validate(payload);

    expect(resultado.rol).toBe('cajero');
  });

  it('rechaza usuarios eliminados', async () => {
    usuariosRepo.findById.mockResolvedValue(null);

    await expect(
      strategy.validate(payload),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
