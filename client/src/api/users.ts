import { apiFetch, type AuthSession } from "./client";

export type PublicUser = {
  _id: string;
  username: string;
  email?: string;
  biography?: string;
  createdAt?: string;
};

export type UserProfileResponse = {
  user: PublicUser;
  posts: {
    count: number;
    likeCount: number;
    data: unknown[];
  };
};

export function register(body: {
  username: string;
  email: string;
  password: string;
}) {
  return apiFetch<AuthSession>("/api/users/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function login(body: { email: string; password: string }) {
  return apiFetch<AuthSession>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getMe() {
  return apiFetch<AuthSession>("/api/users/me", {}, true);
}

export function getUser(username: string) {
  return apiFetch<UserProfileResponse>(`/api/users/${username}`);
}

export function getRandomUsers(size = 5) {
  return apiFetch<PublicUser[]>(`/api/users/random?size=${size}`);
}

export function updateBio(biography: string) {
  return apiFetch<{ success: boolean }>(
    "/api/users",
    {
      method: "PATCH",
      body: JSON.stringify({ biography }),
    },
    true
  );
}
