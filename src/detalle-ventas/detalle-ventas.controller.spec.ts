import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentaController } from './detalle-ventas.controller';
import { DetalleVentaService } from './detalle-ventas.service';

describe('DetalleVentaController', () => {
  let controller: DetalleVentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleVentaController],
      providers: [
        { provide: DetalleVentaService, useValue: { /* Mock mínimo */ } },
      ],
    }).compile();

    controller = module.get<DetalleVentaController>(DetalleVentaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
