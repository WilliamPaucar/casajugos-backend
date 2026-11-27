
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosRepository } from '../../usuarios/usuarios.repositoy';

function getJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');

  if (!secret) {
    throw new Error('JWT_SECRET no configurado');
  }

  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usuariosRepository: UsuariosRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(configService),
    });
  }

  async validate(payload: { sub: number }) {
    const usuario = await this.usuariosRepository.findById(
      payload.sub,
    );

    if (!usuario || !usuario.activo || !usuario.rol) {
      throw new UnauthorizedException(
        'Usuario inexistente o desactivado',
      );
    }

    return {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol.nombre,
    };
  }
}
