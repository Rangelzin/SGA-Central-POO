"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { api, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/lib/api/client";
import type { LoginInput, LoginResponse } from "@/types/api";
import type { Person, Role } from "@/types/domain";

/**
 * O backend usa ALUNO / PROFESSOR no enum Role do Java, mas o frontend
 * espera STUDENT / TEACHER. O JWT já faz esse mapeamento via
 * mapRoleToFrontend(), porém o GET /auth/me devolve o valor bruto do
 * enum. Esta função normaliza qualquer resposta da API.
 */
const backendRoleMap: Record<string, Role> = {
  ALUNO: "STUDENT",
  PROFESSOR: "TEACHER",
  ADMIN: "ADMIN",
  // valores já mapeados (vindos do JWT)
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
};

function normalizeRole(raw: string): Role {
  return backendRoleMap[raw] ?? (raw as Role);
}

/**
 * Normaliza a resposta da API (/auth/me) para o formato Person do frontend.
 * O MeResponse do backend usa campos em português (id, nome) enquanto
 * o frontend espera (uuid, name).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeUser(data: any): Person {
  return {
    uuid: data.uuid ?? data.id ?? "",
    name: data.name ?? data.nome ?? "",
    email: data.email ?? "",
    role: normalizeRole(data.role),
    enrollmentCode: data.enrollmentCode ?? "",
    cpf: data.cpf ?? "",
    birthDate: data.birthDate ?? "",
  };
}

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

/**
 * Extrai dados do JWT e cria um objeto Person
 * Claims esperados: email, sub (nome), pessoaId, role, scope
 */
function extractUserFromToken(token: string): Person | null {
  try {
    const decoded = jwtDecode<{
      email: string;
      sub: string; // nome
      pessoaId: string; // uuid
      role: string; // ALUNO | PROFESSOR | ADMIN (enum Java)
      scope: string[]; // roles/scopes
    }>(token);

    return {
      uuid: decoded.pessoaId,
      name: decoded.sub,
      email: decoded.email,
      role: normalizeRole(decoded.role),
      enrollmentCode: "",
      cpf: "",
      birthDate: "",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Person | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega a sessão do localStorage e sincroniza com o backend via GET /auth/me
  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    const extractedUser = extractUserFromToken(storedToken);
    if (extractedUser) {
      setUser(extractedUser);
    }

    api
      .get<Person>("/auth/me")
      .then((response) => {
        const normalized = normalizeUser(response.data);
        setUser(normalized);
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
      })
      .catch(() => {
        // 401 já é tratado pelo interceptor (limpa sessão e redireciona)
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { data } = await api.post<LoginResponse>("/auth/login", input);
    window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setToken(data.token);
    
    const user = extractUserFromToken(data.token);
    if (user) {
      setUser(user);
      return user;
    }
    throw new Error("Falha ao decodificar token");
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
