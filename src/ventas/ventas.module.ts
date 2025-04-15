import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './ventas.entity';
import { Usuario } from 'src/usuarios/usuario.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Venta, Usuario])],
  providers: [VentasService],
  controllers: [VentasController]
})
export class VentasModule {}
