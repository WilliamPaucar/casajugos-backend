import { Injectable, NotFoundException } from '@nestjs/common';
import { Insumo } from './insumo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateCategoriaDto } from 'src/categorias/dto/update-categoria.dto';

@Injectable()
export class InsumosService {
    constructor(
        @InjectRepository(Insumo)
        private insumoRepository: Repository<Insumo>,
    ) {}

    // Create insumo
      async create(createInsumoDto: CreateInsumoDto): Promise<Insumo> {
        const nuevaCategoria = this.insumoRepository.create(createInsumoDto);
        return this.insumoRepository.save(nuevaCategoria);
      }
    
    // Service obtener todos los insumos
      findAll(): Promise<Insumo[]> {
        return this.insumoRepository.find({order: {id: 'ASC'}});
      }
    //   Obtener por id
        async findOne(id: number): Promise<Insumo> {
          const insumo = await this.insumoRepository.findOne({ where: { id } });
          if (!insumo) throw new NotFoundException('Insumo no encontrado');
          return insumo;
        }

        // Update Inmsumo
          async update(id: number, updateDto: UpdateCategoriaDto): Promise<Insumo> {
            const insumo = await this.findOne(id);
            Object.assign(insumo, updateDto);
            console.log('este es el Object.Assign',updateDto)
            return this.insumoRepository.save(insumo);
          }
        //   Remove Insumo
        async remove(id:number):Promise<void>{
            const insumo=await this.findOne(id);
            await this.insumoRepository.remove(insumo);
        }
        
    

}
