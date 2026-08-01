import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPosts, type Post } from "../api/posts";
import { PostCard } from "../components/PostCard";
import { Reveal, RevealItem, RevealStagger } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { ExplorePill } from "../components/ui/ExplorePill";
import { useAuth } from "../context/AuthContext";
import { PRODUCT } from "../lib/copy";
import {
  SUBCOMMUNITIES,
  getSubcommunity,
  isSubcommunitySlug,
} from "../lib/subcommunities";

const sorts = [
  { value: "-createdAt", label: "Latest" },
  { value: "-likeCount", label: "Likes" },
  { value: "-commentCount", label: "Comments" },
];

export function Explore() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [sortBy, setSortBy] = useState("-createdAt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const spaceParam = searchParams.get("sub") ?? "all";
  const activeSpace = useMemo(() => {
    if (spaceParam === "all") return "all";
    return isSubcommunitySlug(spaceParam) ? spaceParam : "all";
  }, [spaceParam]);

  const spaceMeta =
    activeSpace === "all" ? null : getSubcommunity(activeSpace);

  const setSpace = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === "all") next.delete("sub");
    else next.set("sub", slug);
    setSearchParams(next, { replace: true });
  };

  const load = useCallback(
    async (nextPage: number, replace: boolean) => {
      setLoading(true);
      setError("");
      try {
        const res = await getPosts({
          page: nextPage,
          sortBy,
          subcommunity: activeSpace === "all" ? undefined : activeSpace,
        });
        setCount(res.count);
        setPosts((prev) => (replace ? res.data : [...prev, ...res.data]));
        setPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    },
    [sortBy, activeSpace]
  );

  useEffect(() => {
    void load(1, true);
  }, [load]);

  const hasMore = posts.length < count;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div className="page-hero-dark">
          <p className="section-eyebrow-on-dark mb-3">
            {spaceMeta ? spaceMeta.name : PRODUCT.homeEyebrow}
          </p>
          <h1 className="display mb-3">
            {spaceMeta ? (
              <>
                {spaceMeta.name} <em>space</em>
              </>
            ) : (
              <>
                Live better with <em>diabetes</em>
              </>
            )}
          </h1>
          <p className="body-lg mb-4 max-w-xl">
            {spaceMeta ? spaceMeta.description : PRODUCT.homeLead}
          </p>
          <p className="meta-label mb-6">{PRODUCT.disclaimer}</p>
          <div className="page-hero-actions">
            {user ? (
              <Button
                href={
                  activeSpace === "all"
                    ? "/posts/create"
                    : `/posts/create?sub=${activeSpace}`
                }
              >
                {PRODUCT.newPostCta}
              </Button>
            ) : (
              <Button href="/signup">{PRODUCT.joinCta}</Button>
            )}
            <Button href="/search" variant="secondary">
              {PRODUCT.searchCta}
            </Button>
          </div>
        </div>
      </Reveal>

      <div className="pill-rail" role="toolbar" aria-label="Subcommunities">
        <ExplorePill
          as="button"
          active={activeSpace === "all"}
          onClick={() => setSpace("all")}
        >
          All
        </ExplorePill>
        {SUBCOMMUNITIES.map((space) => (
          <ExplorePill
            key={space.slug}
            as="button"
            active={activeSpace === space.slug}
            onClick={() => setSpace(space.slug)}
          >
            {space.shortLabel}
          </ExplorePill>
        ))}
      </div>

      <div className="pill-rail" role="toolbar" aria-label="Sort discussions">
        {sorts.map((sort) => (
          <ExplorePill
            key={sort.value}
            as="button"
            active={sortBy === sort.value}
            onClick={() => setSortBy(sort.value)}
          >
            {sort.label}
          </ExplorePill>
        ))}
      </div>

      {error ? <p className="error-banner">{error}</p> : null}

      <RevealStagger className="flex flex-col gap-4">
        {posts.map((post) => (
          <RevealItem key={post._id}>
            <PostCard
              post={post}
              onChange={(updated) =>
                setPosts((prev) =>
                  prev.map((p) => (p._id === updated._id ? updated : p))
                )
              }
            />
          </RevealItem>
        ))}
      </RevealStagger>

      {!loading && posts.length === 0 ? (
        <div className="empty-state">
          {activeSpace === "all" ? PRODUCT.emptyFeed : PRODUCT.emptySpace}{" "}
          <Link
            to={
              user
                ? activeSpace === "all"
                  ? "/posts/create"
                  : `/posts/create?sub=${activeSpace}`
                : "/signup"
            }
            className="underline"
          >
            {user ? "Start a discussion" : "Join to post"}
          </Link>
          .
        </div>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            onClick={() => void load(page + 1, false)}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
