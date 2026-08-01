import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { getUser, updateBio, type PublicUser } from "../api/users";
import { getLikedPosts, getPosts, type Post } from "../api/posts";
import { getUserComments, type Comment } from "../api/comments";
import { useAuth } from "../context/AuthContext";
import { PostCard } from "../components/PostCard";
import { Button } from "../components/ui/Button";
import { ExplorePill } from "../components/ui/ExplorePill";
import { Textarea } from "../components/ui/Input";
import { Reveal } from "../components/ui/Reveal";
import { PRODUCT } from "../lib/copy";

type Tab = "posts" | "liked" | "comments";

export function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [stats, setStats] = useState({ count: 0, likeCount: 0 });
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isOwn = me && profile && me.username === profile.username;

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const data = await getUser(username);
        if (cancelled) return;
        setProfile(data.user);
        setBio(data.user.biography || "");
        setStats({
          count: data.posts.count,
          likeCount: data.posts.likeCount,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "User not found");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      try {
        if (tab === "posts") {
          const res = await getPosts({ author: profile.username, page: 1 });
          if (!cancelled) setPosts(res.data);
        } else if (tab === "liked") {
          const res = await getLikedPosts(profile._id, 1);
          if (!cancelled) setPosts(res.data);
        } else {
          const res = await getUserComments(profile._id);
          if (!cancelled) setComments(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tab");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, tab]);

  async function saveBio(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await updateBio(bio);
      setProfile((prev) => (prev ? { ...prev, biography: bio } : prev));
      setEditingBio(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update bio");
    } finally {
      setBusy(false);
    }
  }

  if (error && !profile) {
    return <p className="error-banner">{error}</p>;
  }

  if (!profile) {
    return <div className="empty-state">Loading profile…</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <section className="surface-card">
          <p className="section-eyebrow mb-2">{PRODUCT.profileEyebrow}</p>
          <h1 className="heading-lg mb-2">@{profile.username}</h1>
          <p className="body-lg mb-4">
            {stats.count} posts · {stats.likeCount} likes received
          </p>

          {editingBio ? (
            <form className="flex flex-col gap-3" onSubmit={saveBio}>
              <Textarea
                label="Biography"
                value={bio}
                maxLength={250}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={busy}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingBio(false);
                    setBio(profile.biography || "");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p className="body-lg">{profile.biography || "No bio yet."}</p>
              {isOwn ? (
                <Button
                  className="mt-4"
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditingBio(true)}
                >
                  Edit bio
                </Button>
              ) : me ? (
                <Link
                  to="/messenger"
                  state={{ recipientId: profile._id, username: profile.username }}
                  className="btn-secondary mt-4 inline-flex !w-auto px-4"
                >
                  Message
                </Link>
              ) : null}
            </>
          )}
        </section>
      </Reveal>

      {error ? <p className="error-banner">{error}</p> : null}

      <div className="pill-rail" role="tablist" aria-label="Profile tabs">
        {(
          [
            ["posts", "Posts"],
            ["liked", "Liked"],
            ["comments", "Comments"],
          ] as const
        ).map(([value, label]) => (
          <ExplorePill
            key={value}
            as="button"
            active={tab === value}
            onClick={() => setTab(value)}
          >
            {label}
          </ExplorePill>
        ))}
      </div>

      {tab !== "comments" ? (
        <div className="flex flex-col gap-4">
          {posts.length === 0 ? (
            <div className="empty-state">Nothing here yet.</div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onChange={(updated) =>
                  setPosts((prev) =>
                    prev.map((p) => (p._id === updated._id ? updated : p))
                  )
                }
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.length === 0 ? (
            <div className="empty-state">No comments yet.</div>
          ) : (
            comments.map((comment) => {
              const postId =
                typeof comment.post === "string"
                  ? comment.post
                  : comment.post._id;
              const postTitle =
                typeof comment.post === "object"
                  ? comment.post.title
                  : undefined;
              return (
                <article key={comment._id} className="content-card">
                  <p className="body-sm mb-2 text-fg-muted">
                    on{" "}
                    <Link
                      to={`/posts/${postId}`}
                      className="underline hover:opacity-70"
                    >
                      {postTitle || "a post"}
                    </Link>
                  </p>
                  <p className="body-sm">{comment.content}</p>
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
