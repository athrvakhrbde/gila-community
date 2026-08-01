import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { param } from "../util/params.js";
import { PUBLIC_USER_POPULATE, PUBLIC_USER_SELECT } from "../util/publicUser.js";

function getUserDict(token: string, user: { username: string; _id: unknown; isAdmin?: boolean }) {
  return {
    token,
    username: user.username,
    userId: user._id,
    isAdmin: Boolean(user.isAdmin),
  };
}

function buildToken(user: { _id: unknown; isAdmin?: boolean }) {
  return {
    userId: user._id,
    isAdmin: Boolean(user.isAdmin),
  };
}

function signToken(user: { _id: unknown; isAdmin?: boolean }) {
  const secret = process.env.TOKEN_KEY;
  if (!secret) throw new Error("TOKEN_KEY is not configured");
  return jwt.sign(buildToken(user), secret, { expiresIn: "7d" });
}

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!(username && email && password)) {
      throw new Error("All input required");
    }

    const normalizedEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      throw new Error("Email and username must be unique");
    }

    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = signToken(user);
    return res.json(getUserDict(token, user));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return res.status(400).json({ error: message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!(email && password)) {
      throw new Error("All input required");
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new Error("Email or password incorrect");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email or password incorrect");
    }

    const token = signToken(user);
    return res.json(getUserDict(token, user));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return res.status(400).json({ error: message });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { biography } = req.body as { biography?: string };

    if (!userId) throw new Error("Unauthorized");

    const user = await User.findById(userId);
    if (!user) throw new Error("User does not exist");

    if (typeof biography === "string") {
      user.biography = biography;
    }

    await user.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return res.status(400).json({ error: message });
  }
}

/** Refresh session from DB so admin promotions apply without a full re-login. */
export async function getMe(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error("Unauthorized");

    const user = await User.findById(userId);
    if (!user) throw new Error("User does not exist");

    const token = signToken(user);
    return res.json(getUserDict(token, user));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return res.status(401).json({ error: message });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const username = param(req, "username");
    const user = await User.findOne({ username }).select(PUBLIC_USER_SELECT);

    if (!user) throw new Error("User does not exist");

    const posts = await Post.find({ poster: user._id })
      .populate("poster", PUBLIC_USER_POPULATE)
      .sort("-createdAt")
      .lean();

    let likeCount = 0;
    for (const post of posts) {
      likeCount += post.likeCount ?? 0;
    }

    return res.status(200).json({
      user,
      posts: {
        count: posts.length,
        likeCount,
        data: posts,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "User not found";
    return res.status(400).json({ error: message });
  }
}

export async function getRandomUsers(req: Request, res: Response) {
  try {
    const size = Math.min(Math.max(Number(req.query.size ?? 5) || 5, 1), 20);
    const randomUsers = await User.aggregate([
      { $sample: { size } },
      { $project: { username: 1 } },
    ]);
    return res.status(200).json(randomUsers);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    return res.status(400).json({ error: message });
  }
}
