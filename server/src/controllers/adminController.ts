import type { Request, Response } from "express";
import User from "../models/User.js";
import { param } from "../util/params.js";

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await User.find()
      .select("username email biography isAdmin createdAt")
      .sort("-createdAt")
      .lean();

    return res.json({
      data: users.map((user) => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        biography: user.biography ?? "",
        isAdmin: Boolean(user.isAdmin),
        createdAt: user.createdAt,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list users";
    return res.status(400).json({ error: message });
  }
}

export async function setUserAdmin(req: Request, res: Response) {
  try {
    const username = param(req, "username");
    const { isAdmin } = req.body as { isAdmin?: boolean };

    if (typeof isAdmin !== "boolean") {
      throw new Error("isAdmin must be a boolean");
    }

    const target = await User.findOne({ username });
    if (!target) throw new Error("User does not exist");

    // Prevent removing your own admin access from the panel.
    if (
      !isAdmin &&
      req.user?.userId &&
      String(target._id) === String(req.user.userId)
    ) {
      throw new Error("You cannot remove your own admin access");
    }

    target.isAdmin = isAdmin;
    await target.save();

    return res.json({
      success: true,
      user: {
        _id: target._id,
        username: target.username,
        isAdmin: Boolean(target.isAdmin),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return res.status(400).json({ error: message });
  }
}
