import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductosModule } from './productos/productos.module';
import { TypeOrmModule} from '@nestjs/typeorm'
import { Producto } from './productos/producto.entity';
import { CategoriasModule } from './categorias/categorias.module';
import { Categoria } from './categorias/categoria.entity';
import { InsumosModule } from './insumos/insumos.module';
import { Insumo } from './insumos/insumo.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin123',
      database: 'casajugos',
      entities: [Producto,Categoria, Insumo],
      synchronize: false, // Cambiar a false en producción
    })
    ,ProductosModule, CategoriasModule, InsumosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
