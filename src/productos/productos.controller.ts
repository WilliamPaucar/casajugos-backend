import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update_producto.dto';
import { Producto } from './producto.entity';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

// @UseGuards(JwtAuthGuard, RolesGuard) // Aplica a todo el controlador
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // Ruta tradicional para crear producto sin archivo
  @Post()
  // @Roles('cajero')
  async create(
    @Body() createProductoDto: CreateProductoDto,
  ): Promise<Producto> {
    return this.productosService.create(createProductoDto);
  }

  // Ruta para subir producto con imagen
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads', // Carpeta donde se guardan las imágenes
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new Error('Solo se permiten imágenes'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadProducto(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductoDto: CreateProductoDto,
  ): Promise<Producto> {
    console.log('✅ Controller - Body recibido:', createProductoDto);
    console.log('✅ Controller - Archivo recibido:', file);
    const imageUrl = file ? `/uploads/${file.filename}` : null;
    return this.productosService.create({
      ...createProductoDto,
      imagen: imageUrl,
    });
  }

  @Post('bulk')
  async createMany(@Body() productos: CreateProductoDto[]) {
    return this.productosService.createMany(productos);
  }

  @Get()
  // @Roles('admin')
  async findAll(): Promise<Producto[]> {
    return this.productosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Producto> {
    return this.productosService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @Roles('cajero') // solo usuarios con rol cajero pueden eliminar
  async remove(@Param('id') id: number): Promise<void> {
    return this.productosService.remove(id);
  }
}
