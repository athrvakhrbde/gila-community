import type { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import PostLike from "../models/PostLike.js";
import { param } from "../util/params.js";
import { PUBLIC_USER_POPULATE } from "../util/publicUser.js";

const postCooldown = new Set<string>();
const USER_LIKES_PAGE_SIZE = 9;
const PAGE_SIZE = 10;

type LeanPost = {
  _id: mongoose.Types.ObjectId;
  liked?: boolean;
  userLikePreview?: unknown[];
  [key: string]: unknown;
};

async function setLiked(posts: LeanPost[], userId: string) {
  const likes = await PostLike.find({
    userId,
    postId: { $in: posts.map((p) => p._id) },
  }).lean();

  const likedIds = new Set(likes.map((l) => String(l.postId)));
  for (const post of posts) {
    post.liked = likedIds.has(String(post._id));
  }
}

async function enrichWithUserLikePreview(posts: LeanPost[]) {
  const postMap = new Map(posts.map((p) => [String(p._id), p]));
  const postLikes = await PostLike.find({
    postId: { $in: posts.map((p) => p._id) },
  })
    .limit(200)
    .populate("userId", PUBLIC_USER_POPULATE)
    .lean();

  for (const postLike of postLikes) {
    const post = postMap.get(String(postLike.postId));
    if (!post) continue;
    if (!post.userLikePreview) post.userLikePreview = [];
    post.userLikePreview.push(postLike.userId);
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { title, content } = req.body as { title?: string; content?: string };

    if (!userId) throw new Error("Unauthorized");
    if (!(title && content)) throw new Error("All input required");

    if (postCooldown.has(userId)) {
      throw new Error("You are posting too frequently. Please try again shortly.");
    }

    postCooldown.add(userId);
    setTimeout(() => postCooldown.delete(userId), 60_000);

    const post = await Post.create({ title, content, poster: userId });
    return res.json(post);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return res.status(400).json({ error: message });
  }
}

export async function getPost(req: Request, res: Response) {
  try {
    const postId = param(req, "id");
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new Error("Post does not exist");
    }

    const post = (await Post.findById(postId)
      .populate("poster", PUBLIC_USER_POPULATE)
      .lean()) as LeanPost | null;

    if (!post) throw new Error("Post does not exist");

    if (userId) await setLiked([post], userId);
    await enrichWithUserLikePreview([post]);

    return res.json(post);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Post not found";
    return res.status(400).json({ error: message });
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const postId = param(req, "id");
    const userId = req.user?.userId;
    const isAdmin = req.user?.isAdmin;
    const { content } = req.body as { content?: string };

    if (!userId) throw new Error("Unauthorized");

    const post = await Post.findById(postId);
    if (!post) throw new Error("Post does not exist");

    if (String(post.poster) !== userId && !isAdmin) {
      throw new Error("Not authorized to update post");
    }

    if (typeof content === "string") {
      post.content = content;
      post.edited = true;
    }

    await post.save();
    return res.json(post);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return res.status(400).json({ error: message });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const postId = param(req, "id");
    const userId = req.user?.userId;
    const isAdmin = req.user?.isAdmin;

    if (!userId) throw new Error("Unauthorized");

    const post = await Post.findById(postId);
    if (!post) throw new Error("Post does not exist");

    if (String(post.poster) !== userId && !isAdmin) {
      throw new Error("Not authorized to delete post");
    }

    await Post.findOneAndDelete({ _id: post._id });
    await Comment.deleteMany({ post: post._id });

    return res.json(post);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return res.status(400).json({ error: message });
  }
}

export async function getPosts(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const sortBy = String(req.query.sortBy ?? "-createdAt");
    const author = req.query.author ? String(req.query.author) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (author) {
      const User = (await import("../models/User.js")).default;
      const user = await User.findOne({ username: author }).select("_id");
      if (!user) {
        return res.json({ data: [], count: 0 });
      }
      filter.poster = user._id;
    }

    const count = await Post.countDocuments(filter);
    const posts = (await Post.find(filter)
      .populate("poster", PUBLIC_USER_POPULATE)
      .sort(sortBy)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean()) as LeanPost[];

    if (userId) await setLiked(posts, userId);
    await enrichWithUserLikePreview(posts);

    return res.json({ data: posts, count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch posts";
    return res.status(400).json({ error: message });
  }
}

export async function getUserLikedPosts(req: Request, res: Response) {
  try {
    const likerId = param(req, "id");
    const userId = req.user?.userId;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const sortBy = String(req.query.sortBy ?? "-createdAt");

    const count = await PostLike.countDocuments({ userId: likerId });
    const likes = await PostLike.find({ userId: likerId })
      .sort(sortBy)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate({
        path: "postId",
        populate: { path: "poster", select: PUBLIC_USER_POPULATE },
      })
      .lean();

    const responsePosts = likes
      .map((like) => like.postId)
      .filter(Boolean) as unknown as LeanPost[];

    if (userId) await setLiked(responsePosts, userId);
    await enrichWithUserLikePreview(responsePosts);

    return res.json({ data: responsePosts, count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch liked posts";
    return res.status(400).json({ error: message });
  }
}

export async function likePost(req: Request, res: Response) {
  try {
    const postId = param(req, "id");
    const userId = req.user?.userId;
    if (!userId) throw new Error("Unauthorized");

    const post = await Post.findById(postId);
    if (!post) throw new Error("Post does not exist");

    const existing = await PostLike.findOne({ postId, userId });
    if (existing) throw new Error("Post is already liked");

    await PostLike.create({ postId, userId });
    post.likeCount = await PostLike.countDocuments({ postId });
    await post.save();

    return res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Like failed";
    return res.status(400).json({ error: message });
  }
}

export async function unlikePost(req: Request, res: Response) {
  try {
    const postId = param(req, "id");
    const userId = req.user?.userId;
    if (!userId) throw new Error("Unauthorized");

    const post = await Post.findById(postId);
    if (!post) throw new Error("Post does not exist");

    const existing = await PostLike.findOne({ postId, userId });
    if (!existing) throw new Error("Post is already not liked");

    await PostLike.deleteOne({ _id: existing._id });
    post.likeCount = await PostLike.countDocuments({ postId });
    await post.save();

    return res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unlike failed";
    return res.status(400).json({ error: message });
  }
}

export async function getUserLikes(req: Request, res: Response) {
  try {
    const postId = param(req, "id");
    const anchor = req.query.anchor ? String(req.query.anchor) : undefined;

    const filter: Record<string, unknown> = { postId };
    if (anchor && mongoose.Types.ObjectId.isValid(anchor)) {
      filter._id = { $gt: new mongoose.Types.ObjectId(anchor) };
    }

    const postLikes = await PostLike.find(filter)
      .sort("_id")
      .limit(USER_LIKES_PAGE_SIZE + 1)
      .populate("userId", PUBLIC_USER_POPULATE)
      .exec();
    const hasMorePages = postLikes.length > USER_LIKES_PAGE_SIZE;
    if (hasMorePages) postLikes.pop();

    const userLikes = postLikes.map((like) => {
      const user = like.userId as unknown as { username: string };
      return {
        id: like._id,
        username: user.username,
      };
    });

    return res.json({ userLikes, hasMorePages, success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch likes";
    return res.status(400).json({ error: message });
  }
}
