import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1793325254031 implements MigrationInterface {
    name = 'InitialSchema1793325254031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "categorias" (
                "id" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "insumos" (
                "id" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                "cantidad_disponible" numeric(10, 2) NOT NULL DEFAULT '0',
                "unidad" character varying(50) NOT NULL,
                CONSTRAINT "PK_b4e1b727a7b140e698e3a3dc7af" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "producto_insumo" (
                "producto_id" integer NOT NULL,
                "insumo_id" integer NOT NULL,
                "cantidad_usada" numeric(10, 2) NOT NULL,
                CONSTRAINT "PK_45fc66c7c5a98032d0a5255fcef" PRIMARY KEY ("producto_id", "insumo_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "productos" (
                "id" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                "precio" numeric(10, 2) NOT NULL,
                "imagen" character varying,
                "categoria_id" integer,
                CONSTRAINT "PK_04f604609a0949a7f3b43400766" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL NOT NULL,
                "nombre" character varying(50) NOT NULL,
                CONSTRAINT "roles_nombre_key" UNIQUE ("nombre"),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "usuarios" (
                "id" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                "email" character varying(100) NOT NULL,
                "password_hash" text NOT NULL,
                "activo" boolean DEFAULT true,
                "refreshToken" character varying,
                "rol_id" integer NOT NULL,
                CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"),
                CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "detalle_venta" (
                "id" SERIAL NOT NULL,
                "cantidad" integer NOT NULL,
                "precio_unitario" numeric(10, 2) NOT NULL,
                "observacion" character varying(100),
                "venta_id" integer,
                "producto_id" integer,
                CONSTRAINT "PK_15e83370f604ee4b71e7299514e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_detalle_venta_venta" ON "detalle_venta" ("venta_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_detalle_venta_producto" ON "detalle_venta" ("producto_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "ventas" (
                "id" SERIAL NOT NULL,
                "fecha" TIMESTAMP DEFAULT now(),
                "usuario_id" integer,
                CONSTRAINT "PK_b8b73abe8561829c019531d9a2e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_ventas_fecha" ON "ventas" ("fecha")
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_insumo"
            ADD CONSTRAINT "producto_insumo_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_insumo"
            ADD CONSTRAINT "producto_insumo_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "productos"
            ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "usuarios"
            ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "detalle_venta"
            ADD CONSTRAINT "detalle_venta_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "detalle_venta"
            ADD CONSTRAINT "detalle_venta_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "ventas"
            ADD CONSTRAINT "ventas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

public async down(_queryRunner: QueryRunner): Promise<void> {
  throw new Error(
    'InitialSchema es una migración baseline. ' +
    'Su reversión automática está deshabilitada para proteger los datos.'
  );
}

}
