import { apiFetch } from "./client";

export type AdminUser = {
  _id: string;
  username: string;
  email: string;
  biography?: string;
  isAdmin: boolean;
  createdAt?: string;
};

export function listAdminUsers() {
  return apiFetch<{ data: AdminUser[] }>("/api/admin/users", {}, true);
}

export function setUserAdmin(username: string, isAdmin: boolean) {
  return apiFetch<{
    success: boolean;
    user: { _id: string; username: string; isAdmin: boolean };
  }>(
    `/api/admin/users/${encodeURIComponent(username)}/admin`,
    {
      method: "PATCH",
      body: JSON.stringify({ isAdmin }),
    },
    true
  );
}
