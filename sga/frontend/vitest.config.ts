import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve o alias "@/*" do tsconfig nativamente (Vite 7+)
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // As regras de negócio do mock leem estes valores no load dos módulos
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost/api",
      NEXT_PUBLIC_ENABLE_MOCKS: "true",
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
