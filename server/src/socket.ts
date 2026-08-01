import type { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { AuthUser } from "./types/express.js";

type PresenceUser = { userId: string; socketId: string };

let onlineUsers: PresenceUser[] = [];

export function authSocket(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) {
    next(new Error("Authentication error"));
    return;
  }

  try {
    const secret = process.env.TOKEN_KEY;
    if (!secret) throw new Error("TOKEN_KEY missing");
    const decoded = jwt.verify(token, secret) as AuthUser;
    socket.data.user = {
      userId: String(decoded.userId),
      isAdmin: Boolean(decoded.isAdmin),
    };
    next();
  } catch {
    next(new Error("Authentication error"));
  }
}

export function registerSocketHandlers(_io: Server, socket: Socket) {
  const user = socket.data.user as AuthUser | undefined;
  if (!user) return;

  const userId = user.userId;
  onlineUsers = onlineUsers.filter((u) => u.userId !== userId);
  onlineUsers.push({ userId, socketId: socket.id });

  socket.on(
    "send-message",
    (recipientUserId: string, username: string, content: string) => {
      const recipient = onlineUsers.find((u) => u.userId === recipientUserId);
      if (recipient) {
        socket
          .to(recipient.socketId)
          .emit("receive-message", userId, username, content);
      }
    }
  );

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
  });
}
