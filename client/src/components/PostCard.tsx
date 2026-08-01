import { Link } from "react-router-dom";
import type { Post } from "../api/posts";
import { likePost, unlikePost } from "../api/posts";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  post: Post;
  onChange?: (post: Post) => void;
};

export function PostCard({ post, onChange }: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (!user || busy) return;
    setBusy(true);
    try {
      if (post.liked) {
        await unlikePost(post._id);
        onChange?.({
          ...post,
          liked: false,
          likeCount: Math.max(0, post.likeCount - 1),
        });
      } else {
        await likePost(post._id);
        onChange?.({
          ...post,
          liked: true,
          likeCount: post.likeCount + 1,
        });
      }
    } catch {
      // ignore transient like errors in feed
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="content-card">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link
          to={`/users/${post.poster.username}`}
          className="meta-label no-underline transition-opacity hover:opacity-65"
        >
          @{post.poster.username}
        </Link>
        <span className="meta-label">·</span>
        <time className="meta-label" dateTime={post.createdAt}>
          {formatDate(post.createdAt)}
        </time>
        {post.edited ? <span className="badge">Edited</span> : null}
      </div>

      <h2 className="heading-md break-words-safe mb-2">
        <Link
          to={`/posts/${post._id}`}
          className="no-underline transition-opacity hover:opacity-70"
        >
          {post.title}
        </Link>
      </h2>

      <p className="body-lg break-words-safe mb-5 line-clamp-3">{post.content}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={post.liked ? "pill-filled" : "pill-outline"}
          onClick={toggleLike}
          disabled={!user || busy}
        >
          {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
        </button>
        <Link to={`/posts/${post._id}`} className="pill-outline">
          {post.commentCount}{" "}
          {post.commentCount === 1 ? "comment" : "comments"}
        </Link>
      </div>
    </article>
  );
}
