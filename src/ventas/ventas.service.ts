import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Venta } from './ventas.entity';
import { CreateVentaDto } from './dto/create-ventas.dto';
import { Usuario } from '../usuarios/usuario.entity';
import { UpdateVentaDto } from './dto/update-ventas.dto';
import { DetalleVentaService } from 'src/detalle-ventas/detalle-ventas.service';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventasRepo: Repository<Venta>,

    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    private readonly dataSource: DataSource,
    private readonly detalleService: DetalleVentaService,

  ) { }

  // async crearVenta(dto: CreateVentaDto): Promise<Venta> {
  //   const venta = this.ventasRepo.create();

  //   if (dto.usuarioId) {
  //     const usuario = await this.usuariosRepo.findOneBy({ id: dto.usuarioId });
  //     if (!usuario) throw new NotFoundException('Usuario no encontrado');
  //     venta.usuario = usuario;
  //   }

  //   return this.ventasRepo.save(venta);
  // }

  // REGISTRAR VENTASS
  async registrarVenta(data: CreateVentaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear la venta principal
      const usuario = await queryRunner.manager.findOne(Usuario, {
        where: { id: data.usuarioId },
      });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const venta = await queryRunner.manager.save(Venta, {
        fecha: new Date(),
        usuario: usuario, // 👈 se pasa la relación, no el ID directamente
      });
      // 2. Iterar los productos y crear detalles
      for (const item of data.productos) {
        // Crear el detalle de la venta usando el service reutilizado
        await this.detalleService.crear(
          {
            ventaId: venta.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          },
          queryRunner.manager // importante: para mantener dentro de la transacción
        );

        // 3. Obtener insumos del producto
        const insumos = await queryRunner.manager.query(
          `
        SELECT pi.insumo_id, pi.cantidad_usada, i.cantidad_disponible
        FROM producto_insumo pi
        JOIN insumos i ON i.id = pi.insumo_id
        WHERE pi.producto_id = $1
        `,
          [item.productoId]
        );

        // 4. Validar y descontar insumos
        for (const insumo of insumos) {
          const totalUsado = parseFloat(insumo.cantidad_usada) * item.cantidad;
          const disponible = parseFloat(insumo.cantidad_disponible);

          if (disponible < totalUsado) {
            throw new Error(
              `Insumo insuficiente para insumo_id ${insumo.insumo_id}`
            );
          }

          // Descontar stock del insumo
          await queryRunner.manager.decrement(
            'insumos',
            { id: insumo.insumo_id },
            'cantidad_disponible',
            totalUsado
          );
        }
      }

      // 5. Confirmar transacción
      await queryRunner.commitTransaction();

      return { success: true, ventaId: venta.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al registrar venta: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
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
