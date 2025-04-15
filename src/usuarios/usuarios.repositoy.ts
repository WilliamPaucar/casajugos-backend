import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsuariosRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  create(usuario: Partial<Usuario>) {
    return this.repo.create(usuario);
  }

  save(usuario: Usuario) {
    return this.repo.save(usuario);
  }

  findAll() {
    return this.repo.find();
  }

  findById(id: number) {
    return this.repo.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
