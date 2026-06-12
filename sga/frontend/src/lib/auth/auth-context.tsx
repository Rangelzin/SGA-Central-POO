"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/lib/api/client";
import type { LoginInput, LoginResponse } from "@/types/api";
import type { Person, Role } from "@/types/domain";

interface AuthContextValue {
  user: Person | null;
  token: string | null;
  /** false enquanto a sessão ainda está sendo hidratada do localStorage */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<Person>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Person | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hidrata a sessão e revalida o token com GET /auth/me (RNF-02)
  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!storedToken || !storedUser) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    try {
      setUser(JSON.parse(storedUser) as Person);
    } catch {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }

    api
      .get<Person>("/auth/me")
      .then((response) => {
        setUser(response.data);
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      })
      .catch(() => {
        // 401 já é tratado pelo interceptor (limpa sessão e redireciona)
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { data } = await api.post<LoginResponse>("/auth/login", input);
    window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // sessão local é limpa mesmo se a API falhar
    }
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      hasRole,
    }),
    [user, token, isLoading, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
