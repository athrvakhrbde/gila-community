import type { Request, Response } from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { param } from "../util/params.js";
import { PUBLIC_USER_POPULATE } from "../util/publicUser.js";

const commentCooldown = new Set<string>();

type CommentNode = {
  _id: unknown;
  parent?: unknown;
  children: CommentNode[];
  [key: string]: unknown;
};

export async function createComment(req: Request, res: Response) {
  try {
    const postId = param(req, "id");
    const userId = req.user?.userId;
    const { content, parentId } = req.body as {
      content?: string;
      parentId?: string;
    };

    if (!userId) throw new Error("Unauthorized");
    if (!content) throw new Error("All input required");

    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");

    if (commentCooldown.has(userId)) {
      throw new Error(
        "You are commenting too frequently. Please try again shortly."
      );
    }

    commentCooldown.add(userId);
    setTimeout(() => commentCooldown.delete(userId), 30_000);

    const comment = await Comment.create({
      content,
      parent: parentId || undefined,
      post: postId,
      commenter: userId,
    });

    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $push: { children: comment._id },
      });
    }

    post.commentCount += 1;
    await post.save();

    await comment.populate("commenter", PUBLIC_USER_POPULATE);
    return res.json(comment);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return res.status(400).json({ error: message });
  }
}

export async function getPostComments(req: Request, res: Response) {
  try {
    const postId = param(req, "id");
    const comments = (await Comment.find({ post: postId })
      .populate("commenter", PUBLIC_USER_POPULATE)
      .sort("-createdAt")
      .lean()) as unknown as CommentNode[];

    const commentParents: Record<string, CommentNode> = {};
    const rootComments: CommentNode[] = [];

    for (const comment of comments) {
      comment.children = [];
      commentParents[String(comment._id)] = comment;
    }

    for (const comment of comments) {
      if (comment.parent) {
        const parent = commentParents[String(comment.parent)];
        if (parent) {
          parent.children = [...parent.children, comment];
        } else {
          rootComments.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    }

    return res.json(rootComments);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch comments";
    return res.status(400).json({ error: message });
  }
}

export async function getUserComments(req: Request, res: Response) {
  try {
    const userId = param(req, "id");
    const sortBy = String(req.query.sortBy ?? "-createdAt");
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = 10;

    const comments = await Comment.find({ commenter: userId })
      .sort(sortBy)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("post")
      .lean();

    return res.json(comments);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch comments";
    return res.status(400).json({ error: message });
  }
}

export async function updateComment(req: Request, res: Response) {
  try {
    const commentId = param(req, "id");
    const userId = req.user?.userId;
    const isAdmin = req.user?.isAdmin;
    const { content } = req.body as { content?: string };

    if (!userId) throw new Error("Unauthorized");
    if (!content) throw new Error("All input required");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    if (String(comment.commenter) !== userId && !isAdmin) {
      throw new Error("Not authorized to update comment");
    }

    comment.content = content;
    comment.edited = true;
    await comment.save();

    return res.status(200).json(comment);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return res.status(400).json({ error: message });
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    const commentId = param(req, "id");
    const userId = req.user?.userId;
    const isAdmin = req.user?.isAdmin;

    if (!userId) throw new Error("Unauthorized");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    if (String(comment.commenter) !== userId && !isAdmin) {
      throw new Error("Not authorized to delete comment");
    }

    const postId = comment.post;
    await Comment.findOneAndDelete({ _id: comment._id });

    const post = await Post.findById(postId);
    if (post) {
      post.commentCount = await Comment.countDocuments({ post: post._id });
      await post.save();
    }

    return res.status(200).json(comment);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return res.status(400).json({ error: message });
  }
}
