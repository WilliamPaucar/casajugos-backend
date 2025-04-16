import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Rol } from './rol.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService], // Para usarlo desde usuarios, por ejemplo
})
export class RolesModule {}
