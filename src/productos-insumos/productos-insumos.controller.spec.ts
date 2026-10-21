import { Test, TestingModule } from '@nestjs/testing';
import { ProductoInsumoController } from './productos-insumos.controller';
import { ProductoInsumoService } from './productos-insumos.service';

describe('ProductoInsumoController', () => {
  let controller: ProductoInsumoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoInsumoController],
      providers: [
        { provide: ProductoInsumoService, useValue: { /* Mock mínimo */ } },
      ],
    }).compile();

    controller = module.get<ProductoInsumoController>(ProductoInsumoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
