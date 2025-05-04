// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosRepository } from 'src/usuarios/usuarios.repositoy';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosRepository: UsuariosRepository,
    private readonly jwtService: JwtService,
  ) { }

  // Validar las credenciales de usuario
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usuariosRepository.findByEmail(email);

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    // Retorna solo los datos seguros
    const { password_hash, ...result } = user;
    return result;
  }

  // Login: Generar tanto el access token como el refresh token
  async login(user: any) {
    const payload = { sub: user.id, email: user.email, rol: user.rol.nombre };

    // Generar el access token
    const accessToken = this.jwtService.sign(payload, { expiresIn: '20s' });

    // Generar el refresh token (con una expiración más larga)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d', secret: 'refreshSecret' });

    // Guardar el refresh token en la base de datos si es necesario
    await this.usuariosRepository.saveRefreshToken(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  // Refresh token: Generar un nuevo access token utilizando el refresh token
  async refresh(refreshToken: string) {
    try {
      // Verificar el refresh token
      const decoded = this.jwtService.verify(refreshToken, { secret: 'refreshSecret' });

      // Buscar al usuario asociado con este refresh token
      const user = await this.usuariosRepository.findById(decoded.sub);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      // Generar un nuevo access token
      const payload = { sub: user.id, email: user.email, rol: user.rol.nombre };
      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

      return { access_token: newAccessToken };
    } catch (e) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
