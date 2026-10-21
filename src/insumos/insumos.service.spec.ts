import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { InsumosService } from './insumos.service';
import { Insumo } from './insumo.entity';

describe('InsumosService', () => {
  let service: InsumosService;

  const mockInsumoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          InsumosService,
          {
            provide: getRepositoryToken(Insumo),
            useValue: mockInsumoRepository,
          },
        ],
      }).compile();

    service = module.get<InsumosService>(
      InsumosService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});