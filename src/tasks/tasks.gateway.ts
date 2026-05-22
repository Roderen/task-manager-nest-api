import {
  OnGatewayConnection,
  OnGatewayDisconnect, SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import {Not, Repository} from "typeorm";
import {ConversationMember} from "../messages/entities/conversation-member.entity";
import {InjectRepository} from "@nestjs/typeorm";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
      private jwtService: JwtService,
      @InjectRepository(ConversationMember)
      private conversationMemberRepository: Repository<ConversationMember>,
  ) {}

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
      client.join(`user:${payload.id}`)
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

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, payload: { conversationId: number }) {
    client.join(`chat:${payload.conversationId}`)
    console.log(`User ${client.data.user?.id} joined chat ${payload.conversationId}`)
  }

  async notifyNewMessage(message: any) {
    this.server.to(`chat:${message.conversationId}`).emit('newMessage', message)

    const receiver = await this.conversationMemberRepository.findOne({
      where: {
        conversationId: message.conversationId,
        userId: Not(message.senderId)
      }
    })

    if (receiver) {
      this.server.to(`user:${receiver.userId}`).emit('gotNewMessage', message)
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { conversationId: number }) {
    client.to(`chat:${payload.conversationId}`).emit('userTyping', {
      userId: client.data.user?.id,
      conversationId: payload.conversationId
    })
  }
}
