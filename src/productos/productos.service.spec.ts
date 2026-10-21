import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ProductosService } from './productos.service';
import { Producto } from './producto.entity';
import { Categoria } from '../categorias/categoria.entity';

describe('ProductosService', () => {
  let service: ProductosService;

  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          ProductosService,
          {
            provide: getRepositoryToken(Producto),
            useValue: mockRepository(),
          },
          {
            provide: getRepositoryToken(Categoria),
            useValue: mockRepository(),
          },
        ],
      }).compile();

    service = module.get<ProductosService>(
      ProductosService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});