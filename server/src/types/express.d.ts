import type { Request } from "express";

export interface AuthUser {
  userId: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export type AuthedRequest = Request & { user: AuthUser };
