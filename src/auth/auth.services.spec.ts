
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.services';
import { UsuariosRepository } from '../usuarios/usuarios.repositoy';

describe('AuthService - seguridad del login', () => {
    const repo = {
        findByEmail: jest.fn(),
    };

    const service = new AuthService(
        repo as unknown as UsuariosRepository,
        {} as JwtService,
        {} as ConfigService,
    );

    const password = 'ClaveDePrueba123!';

    beforeEach(() => {
        repo.findByEmail.mockReset();
    });


    it('rota el refresh token e invalida el anterior', async () => {
        const tokenAnterior = 'refresh-token-anterior';

        const usuario = {
            id: 1,
            email: 'usuario@example.com',
            nombre: 'Usuario Prueba',
            activo: true,
            rol: { id: 1, nombre: 'admin' },
            refreshToken: await bcrypt.hash(tokenAnterior, 4),
        };

        const repoMock = {
            findById: jest.fn().mockImplementation(async () => usuario),
            updateRefreshToken: jest.fn().mockImplementation(
                async (_id: number, nuevoHash: string) => {
                    usuario.refreshToken = nuevoHash;
                },
            ),
        };

        const jwtMock = {
            verify: jest.fn().mockReturnValue({ sub: 1 }),
            signAsync: jest.fn()
                .mockResolvedValueOnce('nuevo-access-token')
                .mockResolvedValueOnce('nuevo-refresh-token'),
        };

        const configMock = {
            get: jest.fn().mockReturnValue('secret-solo-jest'),
        };

        const auth = new AuthService(
            repoMock as unknown as UsuariosRepository,
            jwtMock as unknown as JwtService,
            configMock as unknown as ConfigService,
        );

        // Primera renovación: debe funcionar.
        const nuevosTokens = await auth.refreshTokens(tokenAnterior);

        expect(nuevosTokens.refresh_token).toBe('nuevo-refresh-token');

        // El nuevo refresh token debe quedar almacenado como hash.
        expect(repoMock.updateRefreshToken).toHaveBeenCalledWith(
            1,
            expect.any(String),
        );

        expect(
            await bcrypt.compare(
                nuevosTokens.refresh_token,
                usuario.refreshToken,
            ),
        ).toBe(true);

        // Reutilizar el token anterior debe rechazarse.
        await expect(
            auth.refreshTokens(tokenAnterior),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });


    it('revoca el refresh token al cerrar sesión', async () => {
        const tokenAnterior = 'refresh-token-de-prueba';

        let refreshTokenGuardado: string | null =
            await bcrypt.hash(tokenAnterior, 4);

        const repoMock = {
            findById: jest.fn().mockImplementation(async () => ({
                id: 1,
                email: 'usuario@example.com',
                activo: true,
                rol: { id: 1, nombre: 'admin' },
                refreshToken: refreshTokenGuardado,
            })),

            updateRefreshToken: jest.fn().mockImplementation(
                async (_id: number, token: string | null) => {
                    refreshTokenGuardado = token;
                },
            ),
        };

        const jwtMock = {
            verify: jest.fn().mockReturnValue({ sub: 1 }),
            signAsync: jest.fn(),
        };

        const configMock = {
            get: jest.fn().mockReturnValue('secret-solo-jest'),
        };

        const auth = new AuthService(
            repoMock as unknown as UsuariosRepository,
            jwtMock as unknown as JwtService,
            configMock as unknown as ConfigService,
        );

        // Cerrar la sesión.
        await auth.logout(1);

        // Confirmar la revocación del refresh token.
        expect(repoMock.updateRefreshToken)
            .toHaveBeenCalledWith(1, null);

        // Intentar reutilizar el token anterior.
        await expect(
            auth.refreshTokens(tokenAnterior),
        ).rejects.toBeInstanceOf(UnauthorizedException);

        expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });


    it('impide renovar tokens de un usuario desactivado', async () => {
        const refreshToken = 'refresh-token-de-prueba';
        const refreshTokenHash = await bcrypt.hash(refreshToken, 4);

        const repoRefresh = {
            findById: jest.fn().mockResolvedValue({
                id: 1,
                email: 'usuario@example.com',
                nombre: 'Usuario Prueba',
                activo: false,
                rol: { id: 1, nombre: 'admin' },
                refreshToken: refreshTokenHash,
            }),
            updateRefreshToken: jest.fn(),
        };

        const jwtMock = {
            verify: jest.fn().mockReturnValue({ sub: 1 }),
            signAsync: jest.fn().mockResolvedValue('nuevo-token'),
        };

        const configMock = {
            get: jest.fn().mockReturnValue('clave-solo-pruebas'),
        };

        const auth = new AuthService(
            repoRefresh as unknown as UsuariosRepository,
            jwtMock as unknown as JwtService,
            configMock as unknown as ConfigService,
        );

        await expect(
            auth.refreshTokens(refreshToken),
        ).rejects.toBeInstanceOf(UnauthorizedException);

        expect(jwtMock.signAsync).not.toHaveBeenCalled();
        expect(repoRefresh.updateRefreshToken).not.toHaveBeenCalled();
    });


    it('rechaza el login de un usuario desactivado', async () => {
        const passwordHash = await bcrypt.hash(password, 4);

        repo.findByEmail.mockResolvedValue({
            id: 1,
            email: 'usuario@example.com',
            nombre: 'Usuario Prueba',
            password_hash: passwordHash,
            activo: false,
            rol: { id: 1, nombre: 'admin' },
        });

        await expect(
            service.validateUser('usuario@example.com', password),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('permite autenticar un usuario activo', async () => {
        const passwordHash = await bcrypt.hash(password, 4);

        repo.findByEmail.mockResolvedValue({
            id: 1,
            email: 'usuario@example.com',
            nombre: 'Usuario Prueba',
            password_hash: passwordHash,
            activo: true,
            rol: { id: 1, nombre: 'admin' },
        });

        const resultado = await service.validateUser(
            'usuario@example.com',
            password,
        );

        expect(resultado.id).toBe(1);
        expect(resultado).not.toHaveProperty('password_hash');
    });
});
