import { apiFetch } from "./client";

export type Comment = {
  _id: string;
  content: string;
  commenter: { _id: string; username: string };
  post: string | { _id: string; title?: string };
  parent?: string;
  children: Comment[];
  edited?: boolean;
  createdAt: string;
};

export function getPostComments(postId: string) {
  return apiFetch<Comment[]>(`/api/comments/post/${postId}`);
}

export function getUserComments(userId: string) {
  return apiFetch<Comment[]>(`/api/comments/user/${userId}`);
}

export function createComment(
  postId: string,
  body: { content: string; parentId?: string }
) {
  return apiFetch<Comment>(
    `/api/comments/${postId}`,
    { method: "POST", body: JSON.stringify(body) },
    true
  );
}

export function updateComment(id: string, content: string) {
  return apiFetch<Comment>(
    `/api/comments/${id}`,
    { method: "PATCH", body: JSON.stringify({ content }) },
    true
  );
}

export function deleteComment(id: string) {
  return apiFetch<Comment>(`/api/comments/${id}`, { method: "DELETE" }, true);
}
