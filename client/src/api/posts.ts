import { apiFetch } from "./client";

export type Poster = {
  _id: string;
  username: string;
};

export type Post = {
  _id: string;
  title: string;
  content: string;
  poster: Poster;
  subcommunity?: string;
  likeCount: number;
  commentCount: number;
  edited?: boolean;
  liked?: boolean;
  userLikePreview?: Array<{ _id: string; username: string }>;
  createdAt: string;
  updatedAt?: string;
};

export type PostsResponse = {
  data: Post[];
  count: number;
};

export function getPosts(params: {
  page?: number;
  sortBy?: string;
  search?: string;
  author?: string;
  subcommunity?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.search) qs.set("search", params.search);
  if (params.author) qs.set("author", params.author);
  if (params.subcommunity) qs.set("subcommunity", params.subcommunity);
  return apiFetch<PostsResponse>(`/api/posts?${qs.toString()}`);
}

export function getPost(id: string) {
  return apiFetch<Post>(`/api/posts/${id}`);
}

export function createPost(body: {
  title: string;
  content: string;
  subcommunity: string;
}) {
  return apiFetch<Post>(
    "/api/posts",
    { method: "POST", body: JSON.stringify(body) },
    true
  );
}

export function updatePost(id: string, content: string) {
  return apiFetch<Post>(
    `/api/posts/${id}`,
    { method: "PATCH", body: JSON.stringify({ content }) },
    true
  );
}

export function deletePost(id: string) {
  return apiFetch<Post>(`/api/posts/${id}`, { method: "DELETE" }, true);
}

export function likePost(id: string) {
  return apiFetch<{ success: boolean }>(
    `/api/posts/${id}/like`,
    { method: "POST" },
    true
  );
}

export function unlikePost(id: string) {
  return apiFetch<{ success: boolean }>(
    `/api/posts/${id}/like`,
    { method: "DELETE" },
    true
  );
}

export function getLikedPosts(userId: string, page = 1) {
  return apiFetch<PostsResponse>(`/api/posts/liked/${userId}?page=${page}`);
}

export function getPostLikers(postId: string, anchor?: string) {
  const qs = anchor ? `?anchor=${anchor}` : "";
  return apiFetch<{
    userLikes: Array<{ id: string; username: string }>;
    hasMorePages: boolean;
  }>(`/api/posts/${postId}/like${qs}`);
}
