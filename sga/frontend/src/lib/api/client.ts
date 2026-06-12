import axios, { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

export const TOKEN_STORAGE_KEY = "sga.token";
export const USER_STORAGE_KEY = "sga.user";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
});

// Injeta o Bearer token da sessão em toda requisição
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 401 → limpa a sessão e volta para o login (RNF-02)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(USER_STORAGE_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

/** Extrai a mensagem do envelope ApiError; cai num fallback amigável. */
export function getApiMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (error.code === "ERR_NETWORK") return "Falha de conexão com o servidor.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

/** Erros de campo (400) no formato { field, message }[] para mapear no formulário. */
export function getApiFieldErrors(
  error: unknown,
): { field: string; message: string }[] {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.errors ?? [];
  }
  return [];
}
