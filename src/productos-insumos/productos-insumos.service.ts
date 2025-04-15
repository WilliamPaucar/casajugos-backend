import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoInsumo } from './producto-insumo.entity';
import { CreateProductoInsumoDto } from './dto/create-producto-insumo.dto';
import { UpdateProductoInsumoDto } from './dto/update-producto-insumo.dto';

@Injectable()
export class ProductoInsumoService {
  constructor(
    @InjectRepository(ProductoInsumo)
    private readonly productoInsumoRepo: Repository<ProductoInsumo>,
  ) {}

  async create(dto: CreateProductoInsumoDto) {
    const productoInsumo = this.productoInsumoRepo.create(dto);
    return this.productoInsumoRepo.save(productoInsumo);
  }

  findAll() {
    return this.productoInsumoRepo.find();
  }

  async findOne(producto_id: number, insumo_id: number) {
    const result = await this.productoInsumoRepo.findOneBy({ producto_id, insumo_id });
    if (!result) {
      throw new NotFoundException('ProductoInsumo no encontrado');
    }
    return result;
  }

  async update(producto_id: number, insumo_id: number, dto: UpdateProductoInsumoDto) {
    const productoInsumo = await this.findOne(producto_id, insumo_id);
    Object.assign(productoInsumo, dto);
    return this.productoInsumoRepo.save(productoInsumo);
  }

  async remove(producto_id: number, insumo_id: number) {
    const productoInsumo = await this.findOne(producto_id, insumo_id);
    return this.productoInsumoRepo.remove(productoInsumo);
  }
}
