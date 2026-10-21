import { Test, TestingModule } from '@nestjs/testing';
import { ProductoInsumoService } from './productos-insumos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductoInsumo } from '../productos-insumos/producto-insumo.entity';

const makeRepositoryMock = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('ProductoInsumoService', () => {
  let service: ProductoInsumoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoInsumoService,
        { provide: getRepositoryToken(ProductoInsumo), useValue: makeRepositoryMock() },
      ],
    }).compile();

    service = module.get<ProductoInsumoService>(ProductoInsumoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
