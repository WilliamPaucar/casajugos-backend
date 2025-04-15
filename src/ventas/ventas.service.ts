import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './ventas.entity';
import { CreateVentaDto } from './dto/create-ventas.dto';
import { Usuario } from '../usuarios/usuario.entity';
import { UpdateVentaDto } from './dto/update-ventas.dto';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventasRepo: Repository<Venta>,

    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async crearVenta(dto: CreateVentaDto): Promise<Venta> {
    const venta = this.ventasRepo.create();

    if (dto.usuarioId) {
      const usuario = await this.usuariosRepo.findOneBy({ id: dto.usuarioId });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      venta.usuario = usuario;
    }

    return this.ventasRepo.save(venta);
  }

  async obtenerTodas(): Promise<Venta[]> {
    return this.ventasRepo.find({ relations: ['usuario'] });
  }

  async obtenerPorId(id: number): Promise<Venta> {
    const venta = await this.ventasRepo.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!venta) throw new NotFoundException('Venta no encontrada');
    return venta;
  }
  async actualizarVenta(id: number, dto: UpdateVentaDto): Promise<Venta> {
    const venta = await this.ventasRepo.findOne({ where: { id } });
    if (!venta) throw new NotFoundException('Venta no encontrada');
  
    if (dto.usuarioId) {
      const usuario = await this.usuariosRepo.findOneBy({ id: dto.usuarioId });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      venta.usuario = usuario;
    }
  
    return this.ventasRepo.save(venta);
  }
  
  async eliminarVenta(id: number): Promise<void> {
    const venta = await this.ventasRepo.findOne({ where: { id } });
    if (!venta) throw new NotFoundException('Venta no encontrada');
  
    await this.ventasRepo.remove(venta);
  }

}
