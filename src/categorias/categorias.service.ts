import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const nuevaCategoria = this.categoriaRepository.create(createCategoriaDto);
    return this.categoriaRepository.save(nuevaCategoria);
  }

  findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.find();
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  async update(id: number, updateDto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.findOne(id);
    Object.assign(categoria, updateDto);
    return this.categoriaRepository.save(categoria);
  }

  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);
    await this.categoriaRepository.remove(categoria);
  }
}
