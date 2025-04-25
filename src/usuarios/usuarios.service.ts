import { Rol } from "src/roles/rol.entity";
import { UsuariosRepository } from "./usuarios.repositoy";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import bcrypt from 'bcrypt'

@Injectable()
export class UsuariosService {
  constructor(
    private usuariosRepo: UsuariosRepository,
    @InjectRepository(Rol)
    private rolRepo: Repository<Rol>,
  ) {}

  async crear(dto: CreateUsuarioDto) {
    const exist = await this.usuariosRepo.findByEmail(dto.email);
    if (exist) throw new BadRequestException('Email en uso');

    const rol = await this.rolRepo.findOne({ where: { id: dto.rol_id } });
    if (!rol) throw new NotFoundException('Rol inválido');

    const password_hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuariosRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      password_hash,
      rol,
      activo: true,
    });

    return this.usuariosRepo.save(usuario);
  }

  findByEmail(email: string) {
    return this.usuariosRepo.findByEmail(email);
  }
}
