import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const schoolId = client.handshake.query.schoolId;
    if (schoolId) {
      client.join(`school_${schoolId}`);
    }
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendNotification')
  handleMessage(@MessageBody() data: any) {
    // Diffuser à une école spécifique ou à un utilisateur spécifique
    if (data.schoolId) {
      this.server.to(`school_${data.schoolId}`).emit('notification', data);
    } else {
      this.server.emit('notification', data);
    }
  }

  sendAbsenceNotification(schoolId: string, studentName: string) {
    this.server.to(`school_${schoolId}`).emit('notification', {
      type: 'ABSENCE',
      title: 'Alerte Absence',
      message: `L'élève ${studentName} a été marqué absent aujourd'hui.`,
      timestamp: new Date(),
    });
  }
}
