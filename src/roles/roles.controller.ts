// src/roles/roles.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common';
  import { RolesService } from './roles.service';
  import { CreateRolDto } from './dto/create-rol.dto';
  import { UpdateRolDto } from './dto/update-rol.dto';
  
  @Controller('roles')
  export class RolesController {
    constructor(private readonly rolesService: RolesService) {}
  
    @Post()
    create(@Body() dto: CreateRolDto) {
      return this.rolesService.create(dto);
    }
  
    @Get()
    findAll() {
      return this.rolesService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.rolesService.findOne(id);
    }
  
    @Put(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateRolDto,
    ) {
      return this.rolesService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.rolesService.remove(id);
    }
  }
  