import axios, { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

export const TOKEN_STORAGE_KEY = "sga.token";
export const USER_STORAGE_KEY = "sga.user";

const getApiBaseUrl = (): string => {
  // O Next.js substitui o termo abaixo pelo valor real em tempo de build
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Fallback para ambiente de desenvolvimento local
  return "http://localhost:8081/api";
};
export const api = axios.create({
  baseURL: getApiBaseUrl(),
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
  // Se for um erro de axios, tenta extrair a mensagem da resposta ou do erro
  if (axios.isAxiosError<ApiError>(error)) {
    // response?.data pode ser undefined se a requisição falhou antes de chegar ao servidor
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data && data.message) {
      return String(data.message);
    }
    // Erro de rede (ex: servidor offline)
    if (error.code === "ERR_NETWORK") return "Falha de conexão com o servidor.";
    // Erro de timeout
    if (error.code === "ECONNABORTED") return "A requisição expirou.";
  }
  // Se for um erro nativo do JavaScript
  if (error instanceof Error && error.message) return error.message;
  // Fallback para qualquer outro caso
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
