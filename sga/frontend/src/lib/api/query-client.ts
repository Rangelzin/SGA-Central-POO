import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

/**
 * Cache de 30s + sem retry em erros 4xx: respostas rápidas (RNF-03)
 * sem martelar a API com requisições inúteis.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status ?? 0;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}
