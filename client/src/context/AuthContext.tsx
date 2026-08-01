import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession } from "../api/client";
import * as usersApi from "../api/users";

type AuthContextValue = {
  user: AuthSession | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthSession | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(() => readStoredUser());

  const persist = useCallback((session: AuthSession | null) => {
    setUser(session);
    if (session) localStorage.setItem("user", JSON.stringify(session));
    else localStorage.removeItem("user");
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await usersApi.login({ email, password });
      persist(session);
    },
    [persist]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const session = await usersApi.register({ username, email, password });
      persist(session);
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
