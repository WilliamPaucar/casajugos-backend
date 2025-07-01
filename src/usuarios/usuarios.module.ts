import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { UsuariosRepository } from './usuarios.repositoy';
import { RolesModule } from 'src/roles/roles.module';
import { Rol } from 'src/roles/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol]),RolesModule],
  providers: [UsuariosService,UsuariosRepository],
  controllers: [UsuariosController],
  exports: [UsuariosRepository,UsuariosService],
})
export class UsuariosModule {}
