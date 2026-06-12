import { http, HttpResponse } from "msw";
import type { LoginInput, LoginResponse } from "@/types/api";
import { findUserByEmail, MOCK_PASSWORD } from "@/mocks/data/db";
import {
  API_BASE,
  getCurrentUser,
  jsonError,
  networkDelay,
  tokenFor,
  unauthorized,
} from "@/mocks/handlers/utils";

export const authHandlers = [
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await networkDelay();
    const body = (await request.json()) as LoginInput;
    const user = findUserByEmail(body.email ?? "");

    if (!user || body.password !== MOCK_PASSWORD) {
      return jsonError(401, "E-mail ou senha inválidos.");
    }

    const response: LoginResponse = { token: tokenFor(user), user };
    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE}/auth/me`, async ({ request }) => {
    await networkDelay();
    const user = getCurrentUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json(user);
  }),

  http.post(`${API_BASE}/auth/logout`, async () => {
    await networkDelay();
    return new HttpResponse(null, { status: 204 });
  }),
];
