import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

/**
 * Servidor MSW compartilhado por todos os testes: o "backend" durante os
 * testes é o mesmo mock usado no app, então cada teste exercita o contrato real.
 */
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
