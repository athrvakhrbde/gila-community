import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Comment } from "../api/comments";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../api/comments";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Input";
import { Link } from "react-router-dom";

type Props = {
  comments: Comment[];
  postId: string;
  onRefresh: () => void;
  depth?: number;
};

function CommentItem({
  comment,
  postId,
  onRefresh,
  depth = 0,
}: {
  comment: Comment;
  postId: string;
  onRefresh: () => void;
  depth?: number;
}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canEdit =
    user &&
    (user.userId === comment.commenter._id || user.isAdmin);

  async function handleReply() {
    if (!reply.trim()) return;
    setBusy(true);
    setError("");
    try {
      await createComment(postId, {
        content: reply.trim(),
        parentId: comment._id,
      });
      setReply("");
      setReplying(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reply failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate() {
    if (!content.trim()) return;
    setBusy(true);
    setError("");
    try {
      await updateComment(comment._id, content.trim());
      setEditing(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError("");
    try {
      await deleteComment(comment._id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="comment-thread"
      style={{ marginLeft: `min(${Math.min(depth, 3) * 0.5}rem, 1.5rem)` }}
    >
      <div className="mb-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Link
            to={`/users/${comment.commenter.username}`}
            className="meta-label no-underline transition-opacity hover:opacity-65"
          >
            @{comment.commenter.username}
          </Link>
          <time className="meta-label">
            {new Date(comment.createdAt).toLocaleString()}
          </time>
          {comment.edited ? <span className="badge">Edited</span> : null}
        </div>

        {editing ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="action-row">
              <Button size="sm" onClick={handleUpdate} disabled={busy}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setContent(comment.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="markdown-body break-words-safe">
            <ReactMarkdown>{comment.content}</ReactMarkdown>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
          {user ? (
            <Button
              size="sm"
              variant="ghost"
              className="!w-auto"
              onClick={() => setReplying((v) => !v)}
            >
              Reply
            </Button>
          ) : null}
          {canEdit ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="!w-auto"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="!w-auto"
                onClick={handleDelete}
                disabled={busy}
              >
                Delete
              </Button>
            </>
          ) : null}
        </div>

        {error ? <p className="error-banner mt-2">{error}</p> : null}

        {replying ? (
          <div className="mt-3 flex flex-col gap-2">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply (Markdown supported)"
            />
            <div className="action-row">
              <Button size="sm" onClick={handleReply} disabled={busy}>
                Post reply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplying(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {comment.children?.map((child) => (
        <CommentItem
          key={child._id}
          comment={child}
          postId={postId}
          onRefresh={onRefresh}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function CommentTree({ comments, postId, onRefresh }: Props) {
  if (comments.length === 0) {
    return (
      <div className="empty-state">No comments yet. Start the discussion.</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          postId={postId}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
