import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update_producto.dto';
import { Categoria } from '../categorias/categoria.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,

    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>, // Repositorio de categoria
  ) {}

  // Crear un nuevo producto
  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const { nombre, precio, categoria_id } = createProductoDto;

    // Verificar que la categoría existe antes de crear el producto
    const categoria = await this.categoriaRepository.findOne({ where: { id: categoria_id } });
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Crear un producto y asignar la categoría
    const producto = this.productoRepository.create({
      nombre,
      precio,
      categoria,
    });

    return this.productoRepository.save(producto);
  }
  // crear muchos registros a la vez 
  async createMany(productos: CreateProductoDto[]): Promise<Producto[]> {
  const result: Producto[] = [];

  for (const dto of productos) {
    const categoria = await this.categoriaRepository.findOne({ where: { id: dto.categoria_id } });
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${dto.categoria_id} no encontrada`);
    }

    const producto = this.productoRepository.create({
      nombre: dto.nombre,
      precio: dto.precio,
      categoria,
    });

    result.push(await this.productoRepository.save(producto));
  }

  return result;
}

  // Obtener todos los productos con su categoría asociada
  async findAll(): Promise<Producto[]> {

    return this.productoRepository.find({ relations: ['categoria'],    order: {
        id: 'ASC',  // Puedes ordenar por 'id' o por 'nombre', dependiendo de tus necesidades
      }, });
  }

  // Obtener un producto por su ID
  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ['categoria'], // Cargar la relación con la categoría
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  // Actualizar un producto por su ID
  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.productoRepository.findOne({ where: { id }, relations: ['categoria'] });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const { nombre, precio, categoria_id } = updateProductoDto;

    // Si se proporciona una nueva categoría, buscarla y asignarla
    if (categoria_id) {
      const categoria = await this.categoriaRepository.findOne({ where: { id: categoria_id } });
      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }
      producto.categoria = categoria;
    }

    // Actualizar los campos
    producto.nombre = nombre ?? producto.nombre;
    producto.precio = precio ?? producto.precio;

    return this.productoRepository.save(producto);
  }

  // Eliminar un producto por su ID
  async remove(id: number): Promise<void> {
    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    await this.productoRepository.delete(id);
  }
}
