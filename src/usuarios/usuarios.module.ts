import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { UsuariosRepository } from './usuarios.repositoy';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [UsuariosService,UsuariosRepository],
  controllers: [UsuariosController]
})
export class UsuariosModule {}
