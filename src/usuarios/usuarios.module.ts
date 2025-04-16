import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { UsuariosRepository } from './usuarios.repositoy';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]),RolesModule],
  providers: [UsuariosService,UsuariosRepository],
  controllers: [UsuariosController]
})
export class UsuariosModule {}
