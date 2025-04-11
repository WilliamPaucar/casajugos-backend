import { Module } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { Insumo } from './insumo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports:[TypeOrmModule.forFeature([Insumo]), ],
  providers: [InsumosService],
  controllers: [InsumosController],
    exports: [InsumosService]
  
})
export class InsumosModule {}
