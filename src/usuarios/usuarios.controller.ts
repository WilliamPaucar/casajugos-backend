import {
    Controller, Post, Get, Param, Body, Put, Delete, ParseIntPipe,
    Patch,
  } from '@nestjs/common';
  import { UsuariosService } from './usuarios.service';
  import { CreateUsuarioDto } from './dto/create-usuario.dto';
  import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AsignarRolDto } from './dto/asignar-rol-dto';
  
  @Controller('usuarios')
  export class UsuariosController {
    constructor(private readonly service: UsuariosService) {}
  
    @Post()
    create(@Body() dto: CreateUsuarioDto) {
      return this.service.create(dto);
    }
  
    @Get()
    findAll() {
      return this.service.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.service.findOne(id);
    }
  
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
      return this.service.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.service.remove(id);
    }

    @Patch(':id/rol')
asignarRol(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: AsignarRolDto,
) {
  return this.service.asignarRol(id, dto);
}
  }
  