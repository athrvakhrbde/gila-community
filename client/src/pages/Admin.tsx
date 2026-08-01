import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listAdminUsers,
  setUserAdmin,
  type AdminUser,
} from "../api/admin";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { useAuth } from "../context/AuthContext";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Admin() {
  const { user, refreshSession } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUser, setBusyUser] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listAdminUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleAdmin(target: AdminUser) {
    if (!user || busyUser) return;
    const next = !target.isAdmin;
    const action = next ? "make admin" : "remove admin";
    if (!window.confirm(`${action} @${target.username}?`)) return;

    setBusyUser(target.username);
    setError("");
    try {
      const res = await setUserAdmin(target.username, next);
      setUsers((prev) =>
        prev.map((u) =>
          u.username === target.username
            ? { ...u, isAdmin: res.user.isAdmin }
            : u
        )
      );
      if (target.username === user.username) {
        await refreshSession();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyUser("");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div className="page-hero">
          <p className="section-eyebrow">Moderation</p>
          <h1 className="heading-lg">
            Admin <em>panel</em>
          </h1>
          <p className="body-lg max-w-xl">
            Manage moderators. Admins can edit or delete any post or comment,
            and promote other members.
          </p>
        </div>
      </Reveal>

      {error ? <p className="error-banner">{error}</p> : null}

      <Reveal>
        <section className="surface-card overflow-x-auto">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="section-eyebrow mb-0">Members</p>
            <Button
              size="sm"
              variant="secondary"
              animated={false}
              onClick={() => void load()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <p className="body-sm">Loading members…</p>
          ) : users.length === 0 ? (
            <p className="body-sm">No members yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((member) => {
                  const isSelf = member.username === user?.username;
                  return (
                    <tr key={member._id}>
                      <td>
                        <Link
                          to={`/users/${member.username}`}
                          className="body-sm no-underline transition-opacity hover:opacity-65"
                        >
                          @{member.username}
                        </Link>
                        {isSelf ? (
                          <span className="meta-label ml-2">you</span>
                        ) : null}
                      </td>
                      <td className="meta-label">{member.email}</td>
                      <td className="meta-label">
                        {formatDate(member.createdAt)}
                      </td>
                      <td>
                        <span className="badge">
                          {member.isAdmin ? "Admin" : "Member"}
                        </span>
                      </td>
                      <td className="text-right">
                        <Button
                          size="sm"
                          variant={member.isAdmin ? "ghost" : "secondary"}
                          animated={false}
                          className="!w-auto"
                          disabled={
                            busyUser === member.username ||
                            (isSelf && member.isAdmin)
                          }
                          onClick={() => void toggleAdmin(member)}
                          title={
                            isSelf && member.isAdmin
                              ? "You cannot remove your own admin access"
                              : undefined
                          }
                        >
                          {busyUser === member.username
                            ? "Saving…"
                            : member.isAdmin
                              ? "Remove admin"
                              : "Make admin"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </Reveal>
    </div>
  );
}
