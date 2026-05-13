import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway()
export class TaskGateway {
    @WebSocketServer()
    server: Server

    notifyHelpNeeded(task: any) {
        this.server.emit('helpNeeded', task)
    }
}