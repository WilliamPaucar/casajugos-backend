import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  UseGuards, Req,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-ventas.dto';
import { Venta } from './ventas.entity';
import { UpdateVentaDto } from './dto/update-ventas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VentaResponseDto } from './dto/venta-response.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) { }


  @Post()
  async registrarVenta(
    @Body() createVentaDto: CreateVentaDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.ventasService.registrarVenta({
      ...createVentaDto,
      usuarioId: req.user.id,
    });
  }

  @Get()

  obtenerTodas(): Promise<VentaResponseDto[]> {
    return this.ventasService.obtenerTodas();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<VentaResponseDto> {
    return this.ventasService.obtenerPorId(id);
  }
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVentaDto,
  ): Promise<VentaResponseDto> {
    return this.ventasService.actualizarVenta(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ventasService.eliminarVenta(id);
  }
}
