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

  @SubscribeMessage("joinTestRoom")
  handleJoinTestRoom(
    @MessageBody() stationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`test_${stationId}`);
    return { event: "joinedTestRoom", data: stationId };
  }

  @SubscribeMessage("leaveTestRoom")
  handleLeaveTestRoom(
    @MessageBody() stationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`test_${stationId}`);
    return { event: "leftTestRoom", data: stationId };
  }

  @SubscribeMessage("joinWaitingHall")
  handleJoinWaitingHall(@ConnectedSocket() client: Socket) {
    client.join("hall_global");
    return { event: "joinedWaitingHall" };
  }

  emitQueueUpdate(doctorId: string, payload: any) {
    this.server.to(`doctor_${doctorId}`).emit("queue_updated", payload);
    this.server.to("hall_global").emit("queue_updated", { type: "doctor", doctorId, ...payload });
  }

  emitTestQueueUpdate(stationId: string, payload: any) {
    this.server.to(`test_${stationId}`).emit("test_queue_updated", payload);
    this.server.to("hall_global").emit("test_queue_updated", { type: "test", stationId, ...payload });
  }
}
