import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("joinDoctorRoom")
  handleJoinRoom(
    @MessageBody() doctorId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`doctor_${doctorId}`);
    return { event: "joinedRoom", data: doctorId };
  }

  @SubscribeMessage("leaveDoctorRoom")
  handleLeaveRoom(
    @MessageBody() doctorId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`doctor_${doctorId}`);
    return { event: "leftRoom", data: doctorId };
  }

  emitQueueUpdate(doctorId: string, payload: any) {
    this.server.to(`doctor_${doctorId}`).emit("queue_updated", payload);
  }
}
