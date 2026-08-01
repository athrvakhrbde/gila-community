import type { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { verifyToken } from "./auth.js";

async function assertAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).select("isAdmin");
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = { userId, isAdmin: true };
    return next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return res.status(401).json({ error: message });
  }
}

/** Auth + live DB admin check (so promotions/demotions apply immediately). */
export const requireAdmin = [verifyToken, assertAdmin];
