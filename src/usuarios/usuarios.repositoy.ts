import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

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

  async saveRefreshToken(userId: number, refreshToken: string) {
  const user = await this.repo.findOne({ where: { id: userId } });
  if (!user) throw new Error('Usuario no encontrado');

  const hashed = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashed;

  await this.repo.save(user);
}
  findAll() {
    return this.repo.find();
  }

  findById(id: number): Promise<Usuario> {
    return this.repo.findOne({
      where: { id },
      relations: ['rol'], // ⚠️ importante
    });
  }

  findByEmail(email: string): Promise<Usuario> {
    return this.repo.findOne({
      where: { email },
      relations: ['rol'],
    });
  }
    async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.repo.update(userId, { refreshToken });
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
