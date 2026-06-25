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
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost/api",
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
