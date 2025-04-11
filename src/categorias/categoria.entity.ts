import { Producto } from "src/productos/producto.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false} )
  nombre: string;
    
  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}

