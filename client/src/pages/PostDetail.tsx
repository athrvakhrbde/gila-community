import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  deletePost,
  getPost,
  getPostLikers,
  likePost,
  unlikePost,
  updatePost,
  type Post,
} from "../api/posts";
import {
  createComment,
  getPostComments,
  type Comment,
} from "../api/comments";
import { useAuth } from "../context/AuthContext";
import { CommentTree } from "../components/CommentTree";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import { Reveal } from "../components/ui/Reveal";
import { getSubcommunity } from "../lib/subcommunities";
import { HeartIcon, HeartIconFilled } from "../components/ui/Icons";

export function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [likersOpen, setLikersOpen] = useState(false);
  const [likers, setLikers] = useState<Array<{ id: string; username: string }>>(
    []
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError("");
    try {
      const [postData, commentData] = await Promise.all([
        getPost(id),
        getPostComments(id),
      ]);
      setPost(postData);
      setEditContent(postData.content);
      setComments(commentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleLike() {
    if (!post) return;
    if (!user) {
      navigate("/login", { state: { from: `/posts/${post._id}` } });
      return;
    }
    try {
      if (post.liked) {
        await unlikePost(post._id);
        setPost({
          ...post,
          liked: false,
          likeCount: Math.max(0, post.likeCount - 1),
        });
      } else {
        await likePost(post._id);
        setPost({ ...post, liked: true, likeCount: post.likeCount + 1 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Like failed");
    }
  }

  async function openLikers() {
    if (!post) return;
    setLikersOpen(true);
    try {
      const res = await getPostLikers(post._id);
      setLikers(res.userLikes);
    } catch {
      setLikers([]);
    }
  }

  async function onComment(e: FormEvent) {
    e.preventDefault();
    if (!id || !commentText.trim()) return;
    setBusy(true);
    setError("");
    try {
      await createComment(id, { content: commentText.trim() });
      setCommentText("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comment failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!post) return;
    setBusy(true);
    try {
      const updated = await updatePost(post._id, editContent);
      setPost({ ...post, content: updated.content, edited: true });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function removePost() {
    if (!post) return;
    setBusy(true);
    try {
      await deletePost(post._id);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  }

  if (!post && !error) {
    return <div className="empty-state">Loading post…</div>;
  }

  if (!post) {
    return <p className="error-banner">{error}</p>;
  }

  const canEdit =
    user && (user.userId === post.poster._id || user.isAdmin);

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <article className="surface-card">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Link
              to={`/?sub=${post.subcommunity || "general"}`}
              className="badge no-underline"
            >
              {getSubcommunity(post.subcommunity).shortLabel}
            </Link>
            <Link
              to={`/users/${post.poster.username}`}
              className="meta-label no-underline transition-opacity hover:opacity-65"
            >
              @{post.poster.username}
            </Link>
            <span className="meta-label">·</span>
            <time className="meta-label">
              {new Date(post.createdAt).toLocaleString()}
            </time>
            {post.edited ? <span className="badge">Edited</span> : null}
          </div>

          <h1 className="heading-lg break-words-safe mb-4">{post.title}</h1>

          {editing ? (
            <div className="flex flex-col gap-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="action-row">
                <Button onClick={saveEdit} disabled={busy}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="markdown-body break-words-safe">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={post.liked ? "pill-filled" : "pill-outline"}
              onClick={toggleLike}
              disabled={!user}
              aria-label={post.liked ? "Unlike" : "Like"}
              aria-pressed={Boolean(post.liked)}
            >
              {post.liked ? <HeartIconFilled /> : <HeartIcon />}
              <span>
                {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
              </span>
            </button>
            <button type="button" className="pill-outline" onClick={openLikers}>
              <HeartIcon />
              <span>Who liked</span>
            </button>
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
                  onClick={removePost}
                  disabled={busy}
                >
                  Delete
                </Button>
              </>
            ) : null}
          </div>
        </article>
      </Reveal>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="flex flex-col gap-4">
        <div>
          <p className="section-eyebrow mb-1">Peer replies</p>
          <h2 className="heading-md">Comments</h2>
        </div>
        {user ? (
          <form className="surface-card flex flex-col gap-3" onSubmit={onComment}>
            <Textarea
              label="Add a comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Markdown supported"
              required
            />
            <Button type="submit" disabled={busy}>
              {busy ? "Posting…" : "Comment"}
            </Button>
          </form>
        ) : (
          <div className="empty-state">
            <Link to="/login" className="underline">
              Log in
            </Link>{" "}
            to join the conversation.
          </div>
        )}
        <CommentTree comments={comments} postId={post._id} onRefresh={load} />
      </section>

      {likersOpen ? (
        <div className="modal-overlay" onClick={() => setLikersOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="heading-md">Liked by</h3>
              <Button
                size="sm"
                variant="ghost"
                className="!w-auto"
                onClick={() => setLikersOpen(false)}
              >
                Close
              </Button>
            </div>
            <ul className="flex flex-col gap-1">
              {likers.length === 0 ? (
                <li className="body-sm">No likes yet</li>
              ) : (
                likers.map((liker) => (
                  <li key={liker.id}>
                    <Link
                      to={`/users/${liker.username}`}
                      className="body-sm flex min-h-[44px] items-center no-underline transition-opacity hover:opacity-65"
                      onClick={() => setLikersOpen(false)}
                    >
                      @{liker.username}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
