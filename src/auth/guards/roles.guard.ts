// src/auth/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException, // 1. Importa ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si no se requieren roles, se permite el acceso
    }

    const { user } = context.switchToHttp().getRequest();

    // 2. Valida que el objeto 'user' y la propiedad 'rol' existan
    if (!user || !user.rol) {
      throw new ForbiddenException('No se pudo determinar el rol del usuario.');
    }

    // 3. Comprueba si el rol del usuario está en la lista de roles requeridos
    const hasRequiredRole = requiredRoles.includes(user.rol);

    if (!hasRequiredRole) {
      // 4. Si no tiene el rol, lanza la excepción con un mensaje claro
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}.`,
      );
    }

    return true; // 5. Si tiene el rol, permite el acceso
  }
}