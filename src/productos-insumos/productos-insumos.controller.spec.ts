import { Test, TestingModule } from '@nestjs/testing';
import { ProductosInsumosController } from './productos-insumos.controller';

describe('ProductosInsumosController', () => {
  let controller: ProductosInsumosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosInsumosController],
    }).compile();

    controller = module.get<ProductosInsumosController>(ProductosInsumosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
