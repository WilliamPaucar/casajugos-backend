import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false} )
  nombre: string;
  @Column()
  cantidad_disponible:number;

  @Column()
  unidad:string;
    
}
