import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';

@Controller('insumos')
export class InsumosController {
    constructor(private readonly insumoService: InsumosService) { }
    @Post()
    create(@Body() dto: CreateInsumoDto) {
        return this.insumoService.create(dto);
    }

    @Get()
    findAll() {
        console.log("si esta funcionando")
        return this.insumoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.insumoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateInsumoDto) {
        return this.insumoService.update(+id, dto);
    }
    @Delete(':id')
    remove(@Param('id')id:string){
        return this.insumoService.remove(+id)
    }


}
