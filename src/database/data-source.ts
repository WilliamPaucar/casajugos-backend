
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { Producto } from '../productos/producto.entity';
import { Categoria } from '../categorias/categoria.entity';
import { Insumo } from '../insumos/insumo.entity';
import { ProductoInsumo } from '../productos-insumos/producto-insumo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Venta } from '../ventas/ventas.entity';
import { DetalleVenta } from '../detalle-ventas/detalle-venta.entity';
import { Rol } from '../roles/rol.entity';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }
  return value;
};

export default new DataSource({
  type: 'postgres',
  host: requiredEnv('DB_HOST'),
  port: Number(requiredEnv('DB_PORT')),
  username: requiredEnv('DB_USERNAME'),
  password: requiredEnv('DB_PASSWORD'),
  database: requiredEnv('DB_NAME'),

  entities: [
    Producto,
    Categoria,
    Insumo,
    ProductoInsumo,
    Usuario,
    Venta,
    DetalleVenta,
    Rol,
  ],

  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
});
