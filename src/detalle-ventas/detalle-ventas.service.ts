import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleVenta } from './detalle-venta.entity';
import { Venta } from 'src/ventas/ventas.entity';
import { Producto } from 'src/productos/producto.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';

@Injectable()
export class DetalleVentaService {
  constructor(
    @InjectRepository(DetalleVenta)
    private detalleRepo: Repository<DetalleVenta>,

    @InjectRepository(Venta)
    private ventasRepo: Repository<Venta>,

    @InjectRepository(Producto)
    private productosRepo: Repository<Producto>,
  ) {}

async crear(
  dto: CreateDetalleVentaDto,
  manager?: EntityManager
): Promise<DetalleVenta> {
  const repo = manager?.getRepository(DetalleVenta) ?? this.detalleRepo;
  const ventaRepo = manager?.getRepository(Venta) ?? this.ventasRepo;
  const productoRepo = manager?.getRepository(Producto) ?? this.productosRepo;

  const venta = await ventaRepo.findOneBy({ id: dto.ventaId });
  console.log(`esta es la venta : `+ venta.id);
  if (!venta) throw new NotFoundException('Venta no encontrada');

  const producto = await productoRepo.findOneBy({ id: dto.productoId });
  if (!producto) throw new NotFoundException('Producto no encontrado');

  const detalle = repo.create({
    cantidad: dto.cantidad,
    precioUnitario: dto.precioUnitario,
    venta,
    producto,
  });

  return repo.save(detalle);
}


  findAll(): Promise<DetalleVenta[]> {
    return this.detalleRepo.find({ relations: ['venta', 'producto'] });
  }

  async findOne(id: number): Promise<DetalleVenta> {
    const detalle = await this.detalleRepo.findOne({ where: { id }, relations: ['venta', 'producto'] });
    if (!detalle) throw new NotFoundException('Detalle no encontrado');
    return detalle;
  }

  async update(id: number, dto: UpdateDetalleVentaDto): Promise<DetalleVenta> {
    const detalle = await this.findOne(id);

    if (dto.ventaId) {
      const venta = await this.ventasRepo.findOneBy({ id: dto.ventaId });
      if (!venta) throw new NotFoundException('Venta no encontrada');
      detalle.venta = venta;
    }

    if (dto.productoId) {
      const producto = await this.productosRepo.findOneBy({ id: dto.productoId });
      if (!producto) throw new NotFoundException('Producto no encontrado');
      detalle.producto = producto;
    }

    Object.assign(detalle, dto);
    return this.detalleRepo.save(detalle);
  }

  async remove(id: number): Promise<void> {
    const detalle = await this.findOne(id);
    await this.detalleRepo.remove(detalle);
  }
}
