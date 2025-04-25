import { Get, Injectable, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/roles/DECORADORES/roles.decorator";
import { RolesGuard } from "src/roles/DECORADORES/roles.guard";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

}


