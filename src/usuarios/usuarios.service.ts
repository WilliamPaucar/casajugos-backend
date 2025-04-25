import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosRepository } from './usuarios.repositoy';
import { UsuarioDto } from './dto/usuario.dto';
import * as bcrypt from 'bcrypt';
import { RolesService } from 'src/roles/roles.service';
import { toUsuarioDto } from './utils/usuario.mapper';
import { AsignarRolDto } from './dto/asignar-rol-dto';
@Injectable()
export class UsuariosService {
  constructor(
    private readonly repo: UsuariosRepository,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioDto> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.repo.create({ ...dto, password_hash: hash });
    const saved = await this.repo.save(usuario);
    return toUsuarioDto(saved);
  }

  async findAll(): Promise<UsuarioDto[]> {
    const usuarios = await this.repo.findAll();
    return usuarios.map(toUsuarioDto);
  }

  async findByEmail(email: string): Promise<UsuarioDto | undefined> {
    const user = await this.repo.findByEmail(email);
    if (!user) return undefined;

    return toUsuarioDto(user);
  }

  async findById(id: number): Promise<UsuarioDto> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return toUsuarioDto(user);
  }

  async findOne(id: number): Promise<UsuarioDto> {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return toUsuarioDto(usuario);
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioDto> {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (dto.password) {
      dto['password_hash'] = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.repo.save({ ...usuario, ...dto });
    return toUsuarioDto(updated);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async asignarRol(id: number, dto: AsignarRolDto): Promise<UsuarioDto> {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const rol = await this.rolesService.findOne(dto.rolId);
    usuario.rol = rol;

    const actualizado = await this.repo.save(usuario);
    return toUsuarioDto(actualizado);
  }
}
