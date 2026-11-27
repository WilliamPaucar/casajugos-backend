// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosRepository } from 'src/usuarios/usuarios.repositoy'; // Corregí typo "repositoy"
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokensDto } from './dto/tokens.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosRepository: UsuariosRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

  ) { }

  // Validar credenciales de usuario

  async validateUser(email: string, password: string) {
    const user = await this.usuariosRepository.findByEmail(email);

    // No revelar si la cuenta existe o está desactivada
    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar la contraseña
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // No devolver información sensible
    const { password_hash, refreshToken, ...result } = user;

    return result;
  }


  // Login: Generar access y refresh tokens, guardar refresh en BD
  async login(user: any) {
    const payload = { sub: user.id, email: user.email, rol: user.rol.nombre, nombre: user.nombre };


    const accessToken = this.jwtService.sign(payload, { expiresIn: process.env.JWT_EXPIRES_IN }); // Ejemplo: 20 minutos
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET',
      ),
    });

    // Guardar refresh token en BD (puedes almacenar un hash para más seguridad)
    await this.usuariosRepository.saveRefreshToken(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  // Refrescar token usando refresh token válido
  async refreshTokens(refreshToken: string): Promise<TokensDto> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usuariosRepository.findById(decoded.sub);

      // Comprobar el estado actual del usuario en PostgreSQL
      if (
        !user ||
        !user.activo ||
        !user.rol ||
        !user.refreshToken
      ) {
        throw new UnauthorizedException('Token inválido');
      }


      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('Token inválido');
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        rol: user.rol.nombre,
        nombre: user.nombre,
      };

      const tokens = await this.generateTokens(payload);

      const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
      await this.usuariosRepository.updateRefreshToken(user.id, hashedRefresh);

      return tokens;
    } catch (e) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async generateTokens(payload: JwtPayload): Promise<TokensDto> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { access_token, refresh_token };
  }
  // Logout: eliminar el refresh token guardado en BD
  async logout(userId: number) {
    if (!userId) {
      throw new Error('ID de usuario no definido');
    }
    await this.usuariosRepository.updateRefreshToken(userId, null);
  }
}