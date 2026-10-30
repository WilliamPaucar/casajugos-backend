import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeVentaFechaDefault1793327458779 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "ventas" ALTER COLUMN "fecha" SET DEFAULT now()`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "ventas" ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP`,
        );
    }


}
