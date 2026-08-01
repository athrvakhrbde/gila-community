import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/express.js";

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  const legacy = req.headers["x-access-token"];
  if (typeof legacy === "string" && legacy.length > 0) {
    return legacy;
  }
  return null;
}

function verify(token: string): AuthUser {
  const secret = process.env.TOKEN_KEY;
  if (!secret) {
    throw new Error("TOKEN_KEY is not configured");
  }
  const decoded = jwt.verify(token, secret) as AuthUser;
  return { userId: String(decoded.userId), isAdmin: Boolean(decoded.isAdmin) };
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new Error("No token provided");
    }
    req.user = verify(token);
    return next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return res.status(401).json({ error: message });
  }
}

export function optionallyVerifyToken(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    req.user = verify(token);
    return next();
  } catch {
    return next();
  }
}
