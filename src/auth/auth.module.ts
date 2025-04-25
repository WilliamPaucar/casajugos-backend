import { JwtModule } from "@nestjs/jwt";
import { UsuariosModule } from "src/usuarios/usuarios.module";
import { AuthService } from "./auth.services";
import { JwtStrategy } from "./jwt.strategy";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
      UsuariosModule,
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
  })
  export class AuthModule {}
  