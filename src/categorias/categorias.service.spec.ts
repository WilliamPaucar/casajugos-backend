import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CategoriasService } from './categorias.service';
import { Categoria } from './categoria.entity';

describe('CategoriasService', () => {
  let service: CategoriasService;

  const mockCategoriaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          CategoriasService,
          {
            provide: getRepositoryToken(Categoria),
            useValue: mockCategoriaRepository,
          },
        ],
      }).compile();

    service = module.get<CategoriasService>(
      CategoriasService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});