import { io, type Socket } from "socket.io-client";
import { API_BASE, type AuthSession } from "../api/client";

let socket: Socket | null = null;

export function connectSocket(user: AuthSession) {
  if (socket?.connected) return socket;

  socket = io(API_BASE || undefined, {
    auth: { token: user.token },
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
