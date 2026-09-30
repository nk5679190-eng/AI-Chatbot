import { Server as SocketIOServer, Socket } from 'socket.io';

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join Ticket Room
    socket.on('join_ticket_room', ({ ticketId }: { ticketId: string }) => {
      if (ticketId) {
        socket.join(`ticket_${ticketId}`);
        console.log(`[Socket.IO] ${socket.id} joined ticket_${ticketId}`);
      }
    });

    // Leave Ticket Room
    socket.on('leave_ticket_room', ({ ticketId }: { ticketId: string }) => {
      if (ticketId) {
        socket.leave(`ticket_${ticketId}`);
      }
    });

    // Real-time Ticket Message Broadcast
    socket.on('send_ticket_message', (data: { ticketId: string; message: any }) => {
      if (data?.ticketId) {
        io.to(`ticket_${data.ticketId}`).emit('new_ticket_message', data.message);
      }
    });

    // Typing Status Broadcast
    socket.on('typing_status', (data: { ticketId: string; senderName: string; isTyping: boolean }) => {
      if (data?.ticketId) {
        socket.to(`ticket_${data.ticketId}`).emit('typing_status', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}
