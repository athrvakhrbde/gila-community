import { useState, type FormEvent } from "react";
import { getPosts, type Post } from "../api/posts";
import { PostCard } from "../components/PostCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Reveal } from "../components/ui/Reveal";
import { PRODUCT } from "../lib/copy";

export function Search() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await getPosts({ search: query.trim(), page: 1 });
      setPosts(res.data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div className="page-hero">
          <p className="section-eyebrow">{PRODUCT.searchEyebrow}</p>
          <h1 className="heading-lg">
            Search the <em>community</em>
          </h1>
          <p className="body-lg">
            Find peer discussions on diet, blood sugar readings, exercise, and
            daily life with diabetes in India.
          </p>
          <form
            className="action-row mt-2 sm:items-end"
            onSubmit={onSubmit}
          >
            <div className="w-full min-w-0 flex-1">
              <Input
                id="search"
                label="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title"
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Searching…" : "Search"}
            </Button>
          </form>
        </div>
      </Reveal>

      {error ? <p className="error-banner">{error}</p> : null}

      {searched && posts.length === 0 ? (
        <div className="empty-state">No posts matched “{query}”.</div>
      ) : null}

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onChange={(updated) =>
              setPosts((prev) =>
                prev.map((p) => (p._id === updated._id ? updated : p))
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
