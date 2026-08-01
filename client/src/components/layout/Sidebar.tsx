import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRandomUsers, type PublicUser } from "../../api/users";
import { getPosts, type Post } from "../../api/posts";
import { Reveal } from "../ui/Reveal";
import { PRODUCT } from "../../lib/copy";
import { SUBCOMMUNITIES } from "../../lib/subcommunities";

export function Sidebar() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [topPosts, setTopPosts] = useState<Post[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [random, posts] = await Promise.all([
          getRandomUsers(5),
          getPosts({ page: 1, sortBy: "-likeCount" }),
        ]);
        if (!cancelled) {
          setUsers(random);
          setTopPosts(posts.data.slice(0, 5));
        }
      } catch {
        // sidebar is best-effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Reveal>
        <section className="sidebar-panel">
          <p className="section-eyebrow mb-3">{PRODUCT.sidebarSpaces}</p>
          <ul className="flex flex-col gap-1">
            {SUBCOMMUNITIES.map((space) => (
              <li key={space.slug}>
                <Link
                  to={`/?sub=${space.slug}`}
                  className="body-sm flex min-h-[40px] items-center text-fg no-underline transition-opacity hover:opacity-65"
                >
                  {space.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal delay={0.04}>
        <section className="sidebar-panel">
          <p className="section-eyebrow mb-3">{PRODUCT.sidebarMembers}</p>
          <ul className="flex flex-col gap-1">
            {users.length === 0 ? (
              <li className="body-sm">No members yet</li>
            ) : (
              users.map((u) => (
                <li key={u._id}>
                  <Link
                    to={`/users/${u.username}`}
                    className="body-sm flex min-h-[40px] items-center text-fg no-underline transition-opacity hover:opacity-65"
                  >
                    @{u.username}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section className="sidebar-panel">
          <p className="section-eyebrow mb-3">{PRODUCT.sidebarTop}</p>
          <ul className="flex flex-col gap-3">
            {topPosts.length === 0 ? (
              <li className="body-sm">Nothing ranked yet</li>
            ) : (
              topPosts.map((post) => (
                <li key={post._id}>
                  <Link
                    to={`/posts/${post._id}`}
                    className="body-sm break-words-safe block text-fg no-underline transition-opacity hover:opacity-65"
                  >
                    {post.title}
                  </Link>
                  <p className="meta-label mt-1">
                    {post.likeCount}{" "}
                    {post.likeCount === 1 ? "like" : "likes"} ·{" "}
                    {post.commentCount}{" "}
                    {post.commentCount === 1 ? "comment" : "comments"}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </Reveal>
    </>
  );
}
