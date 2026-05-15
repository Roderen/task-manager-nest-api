import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private jwtService: JwtService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.cookie
      ?.split(';')
      .find((c) => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      console.log(`Client connected: ${client.id}, user: ${payload.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(
      `Client disconnected: ${client.id}, user: ${client.data.user?.id}`,
    );
  }

  notifyHelpNeeded(task: any, userId: number) {
    this.server.sockets.sockets.forEach((socket) => {
      if (socket.data.user?.id !== userId) {
        socket.emit('helpNeeded', task)
      }
    })
  }

  notifyHelpCancelNeeded(taskId: any) {
    this.server.emit('helpCancelNeeded', taskId)
  }
}
