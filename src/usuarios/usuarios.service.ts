import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosRepository } from './usuarios.repositoy';
import { UsuarioDto } from './dto/usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly repo: UsuariosRepository) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioDto> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.repo.create({ ...dto, password_hash: hash });
    const saved = await this.repo.save(usuario);
    const { password_hash, ...rest } = saved;
    return rest;
  }

  async findAll(): Promise<UsuarioDto[]> {
    const usuarios = await this.repo.findAll();
    return usuarios.map(({ password_hash, ...rest }) => rest);
  }

  async findOne(id: number): Promise<UsuarioDto> {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    const { password_hash, ...rest } = usuario;
    return rest;
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioDto> {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (dto.password) {
      dto['password_hash'] = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.repo.save({ ...usuario, ...dto });
    const { password_hash, ...rest } = updated;
    return rest;
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
