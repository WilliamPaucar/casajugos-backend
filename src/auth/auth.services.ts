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
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usuariosRepository.findByEmail(email); // 👈 devuelve entidad Usuario

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    // Retornar solo los datos seguros
    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, rol: user.rol.nombre };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
