import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentaService } from './detalle-ventas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DetalleVenta } from '../detalle-ventas/detalle-venta.entity';
import { Venta } from '../ventas/ventas.entity';
import { Producto } from '../productos/producto.entity';

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

describe('DetalleVentaService', () => {
  let service: DetalleVentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetalleVentaService,
        { provide: getRepositoryToken(DetalleVenta), useValue: makeRepositoryMock() },
        { provide: getRepositoryToken(Venta), useValue: makeRepositoryMock() },
        { provide: getRepositoryToken(Producto), useValue: makeRepositoryMock() },
      ],
    }).compile();

    service = module.get<DetalleVentaService>(DetalleVentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
