import { http, HttpResponse } from "msw";
import { courses, departments } from "@/mocks/data/db";
import {
  API_BASE,
  getCurrentUser,
  networkDelay,
  unauthorized,
} from "@/mocks/handlers/utils";

export const supportHandlers = [
  http.get(`${API_BASE}/courses`, async ({ request }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();
    return HttpResponse.json(courses);
  }),

  http.get(`${API_BASE}/departments`, async ({ request }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();
    return HttpResponse.json(departments);
  }),
];
