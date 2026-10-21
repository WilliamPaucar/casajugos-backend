import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Venta } from '../ventas/ventas.entity';
import { VentasGateway } from '../ventas/gateway/ventas.gateway';
import { Usuario } from '../usuarios/usuario.entity';
import { DataSource } from 'typeorm';
import { DetalleVentaService } from '../detalle-ventas/detalle-ventas.service';

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

describe('VentasService', () => {
  let service: VentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        { provide: getRepositoryToken(Venta), useValue: makeRepositoryMock() },
        { provide: VentasGateway, useValue: { /* Mock mínimo */ } },
        { provide: getRepositoryToken(Usuario), useValue: makeRepositoryMock() },
        { provide: DataSource, useValue: { /* Mock mínimo */ } },
        { provide: DetalleVentaService, useValue: { /* Mock mínimo */ } },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
