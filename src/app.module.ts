import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Producto } from './productos/producto.entity';
import { Categoria } from './categorias/categoria.entity';
import { Insumo } from './insumos/insumo.entity';
import { ProductoInsumo } from './productos-insumos/producto-insumo.entity';
import { Usuario } from './usuarios/usuario.entity';
import { Venta } from './ventas/ventas.entity';
import { DetalleVenta } from './detalle-ventas/detalle-venta.entity';
import { Rol } from './roles/rol.entity';

import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { InsumosModule } from './insumos/insumos.module';
import { ProductosInsumosModule } from './productos-insumos/productos-insumos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VentasModule } from './ventas/ventas.module';
import { DetalleVentasModule } from './detalle-ventas/detalle-ventas.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // hace que esté disponible en todo el proyecto
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Producto, Categoria, Insumo, ProductoInsumo, Usuario, Venta, DetalleVenta, Rol],
        synchronize: false, // true solo en desarrollo
      }),
    }),
    ProductosModule,
    CategoriasModule,
    InsumosModule,
    ProductosInsumosModule,
    UsuariosModule,
    VentasModule,
    DetalleVentasModule,
    RolesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
