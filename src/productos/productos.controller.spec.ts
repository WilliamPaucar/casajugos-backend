import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

describe('ProductosController', () => {
  let controller: ProductosController;

  const mockProductosService = {
    create: jest.fn(),
    createMany: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [ProductosController],
        providers: [
          {
            provide: ProductosService,
            useValue: mockProductosService,
          },
        ],
      }).compile();

    controller = module.get<ProductosController>(
      ProductosController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});