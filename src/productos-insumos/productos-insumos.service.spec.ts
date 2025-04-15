import { Test, TestingModule } from '@nestjs/testing';
import { ProductosInsumosService } from './productos-insumos.service';

describe('ProductosInsumosService', () => {
  let service: ProductosInsumosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductosInsumosService],
    }).compile();

    service = module.get<ProductosInsumosService>(ProductosInsumosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
