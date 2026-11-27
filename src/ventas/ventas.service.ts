import {
  Injectable, NotFoundException, HttpException,
  InternalServerErrorException, Logger, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Venta } from './ventas.entity';
import { CreateVentaDto } from './dto/create-ventas.dto';
import { Usuario } from '../usuarios/usuario.entity';
import { UpdateVentaDto } from './dto/update-ventas.dto';
import { DetalleVentaService } from 'src/detalle-ventas/detalle-ventas.service';
import { VentasGateway } from './gateway/ventas.gateway';
import {
  toVentaResponseDto,
  VentaResponseDto,
} from './dto/venta-response.dto';
import { Producto } from '../productos/producto.entity';

@Injectable()
export class VentasService {
  private readonly logger = new Logger(VentasService.name);
  constructor(
    @InjectRepository(Venta)
    private readonly ventasRepo: Repository<Venta>,
    private readonly ventasGateway: VentasGateway,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    private readonly dataSource: DataSource,
    private readonly detalleService: DetalleVentaService,
  ) { }


  // REGISTRAR VENTASS
  async registrarVenta(data: CreateVentaDto & { usuarioId: number },) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let ventaConfirmada: {
      id: number;
      fecha: Date;
      usuario: { nombre: string };
      detalles: [];
    } | null = null;
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
      const cantidadesPorInsumo = new Map<number, number>();

      for (const item of data.productos) {
        // Consultar el producto y su precio autorizado.
        const producto = await queryRunner.manager.findOne(
          Producto,
          { where: { id: item.productoId } },
        );

        if (!producto) {
          throw new NotFoundException(
            `Producto con ID ${item.productoId} no encontrado`,
          );
        }

        const precioAutorizado = Number(producto.precio);

        if (
          !Number.isFinite(precioAutorizado) ||
          precioAutorizado <= 0
        ) {
          throw new InternalServerErrorException(
            'Precio del producto inválido',
          );
        }

        // Crear el detalle dentro de la misma transacción.
        await this.detalleService.crear(
          {
            ventaId: venta.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: precioAutorizado,
            observacion: item.observacion,
          },
          queryRunner.manager,
        );

        // Consultar la receta sin bloquear todavía el inventario.
        const insumos = await queryRunner.manager.query(
          `
    SELECT pi.insumo_id, pi.cantidad_usada
    FROM producto_insumo pi
    WHERE pi.producto_id = $1
    `,
          [item.productoId],
        );

        // Acumular la cantidad requerida por cada insumo.
        for (const insumo of insumos) {
          const insumoId = Number(insumo.insumo_id);
          const cantidadPorUnidad = Number(insumo.cantidad_usada);

          if (
            !Number.isInteger(insumoId) ||
            insumoId <= 0 ||
            !Number.isFinite(cantidadPorUnidad) ||
            cantidadPorUnidad <= 0
          ) {
            throw new InternalServerErrorException(
              'Configuración de insumos inválida',
            );
          }

          const cantidadRequerida =
            cantidadPorUnidad * item.cantidad;

          const acumulado = cantidadesPorInsumo.get(insumoId) ?? 0;

          cantidadesPorInsumo.set(
            insumoId,
            acumulado + cantidadRequerida,
          );
        }
      }

      // Establecer un orden global para adquirir los bloqueos.
      const insumoIds = [...cantidadesPorInsumo.keys()]
        .sort((a, b) => a - b);

      // Bloquear y validar todas las existencias.
      for (const insumoId of insumoIds) {
        const filas = await queryRunner.manager.query(
          `
    SELECT i.id, i.cantidad_disponible
    FROM insumos i
    WHERE i.id = $1
    FOR UPDATE OF i
    `,
          [insumoId],
        );

        if (filas.length === 0) {
          throw new NotFoundException(
            `Insumo ${insumoId} no encontrado`,
          );
        }

        const disponible = Number(filas[0].cantidad_disponible);
        const requerido = cantidadesPorInsumo.get(insumoId)!;

        if (
          !Number.isFinite(disponible) ||
          disponible < requerido
        ) {
          throw new ConflictException(
            `Inventario insuficiente para el insumo ${insumoId}`,
          );
        }
      }

      // Todas las existencias fueron verificadas.
      // Los bloqueos siguen activos hasta el commit o rollback.
      for (const insumoId of insumoIds) {
        const cantidadTotal = cantidadesPorInsumo.get(insumoId)!;

        await queryRunner.manager.decrement(
          'insumos',
          { id: insumoId },
          'cantidad_disponible',
          cantidadTotal,
        );
      }


      await queryRunner.commitTransaction();

      ventaConfirmada = {
        id: venta.id,
        fecha: venta.fecha,
        usuario: {
          nombre: usuario.nombre,
        },
        detalles: [],
      };


    } catch (error) {
      // Revertir los cambios realizados en la transacción.
      await queryRunner.rollbackTransaction();

      // Conservar las excepciones HTTP de NestJS.
      if (error instanceof HttpException) {
        throw error;
      }

      // No exponer errores internos de PostgreSQL al cliente.
      throw new InternalServerErrorException(
        'No se pudo registrar la venta',
      );
    } finally {
      await queryRunner.release();
    }

    if (!ventaConfirmada) {
      throw new InternalServerErrorException(
        'No se pudo confirmar la venta',
      );
    }

    // PostgreSQL ya confirmó y se liberó el QueryRunner.
    try {
      this.ventasGateway.emitirVentaCreada(ventaConfirmada);
    } catch {
      // No cambiar el resultado de una venta confirmada.
      this.logger.warn(
        `Venta ${ventaConfirmada.id} confirmada, pero falló la notificación WebSocket`,
      );
    }

    // La venta se registró correctamente.
    return {
      success: true,
      ventaId: ventaConfirmada.id,
    };


  }


  async obtenerTodas(): Promise<VentaResponseDto[]> {
    const ventas = await this.ventasRepo.find({
      relations: {
        usuario: {
          rol: true,
        },
        detalles: {
          producto: true,
        },
      },
      order: {
        fecha: 'DESC',
      },
    });

    return ventas.map(toVentaResponseDto);
  }



  async obtenerPorId(id: number): Promise<VentaResponseDto> {
    const venta = await this.ventasRepo.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    return toVentaResponseDto(venta);
  }

  async actualizarVenta(
    id: number,
    dto: UpdateVentaDto,
  ): Promise<VentaResponseDto> {
    const venta = await this.ventasRepo.findOne({ where: { id } });
    if (!venta) throw new NotFoundException('Venta no encontrada');

    if (dto.usuarioId) {
      const usuario = await this.usuariosRepo.findOneBy({ id: dto.usuarioId });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      venta.usuario = usuario;
    }

    const ventaActualizada = await this.ventasRepo.save(venta);

    return toVentaResponseDto(ventaActualizada);
  }

  async eliminarVenta(id: number): Promise<void> {
    const venta = await this.ventasRepo.findOne({ where: { id } });
    if (!venta) throw new NotFoundException('Venta no encontrada');

    await this.ventasRepo.remove(venta);
  }
}
