import { Get, Injectable, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/roles/DECORADORES/roles.decorator";
import { RolesGuard } from "src/roles/DECORADORES/roles.guard";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info, context) {
        if (err || !user) {
          // Puedes personalizar el mensaje según el error
          throw new UnauthorizedException('Debe estar autenticado para acceder a este recurso.');
        }
        return user;
      }
}


