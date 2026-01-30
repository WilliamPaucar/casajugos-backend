import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VentasGateway {
  @WebSocketServer()
  server: Server;

  emitirVentaCreada(venta: any) {
    this.server.emit('venta_creada', venta);
  }
}
