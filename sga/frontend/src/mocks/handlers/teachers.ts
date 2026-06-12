import { http, HttpResponse } from "msw";
import type { TeacherInput } from "@/types/api";
import type { Teacher } from "@/types/domain";
import {
  departments,
  findUserByEmail,
  nextUuid,
  teachers,
} from "@/mocks/data/db";
import {
  API_BASE,
  getCurrentUser,
  jsonError,
  matchesSearch,
  networkDelay,
  notFound,
  paginate,
  unauthorized,
} from "@/mocks/handlers/utils";

let teacherCodeSequence = 6;

function validateTeacherInput(
  input: Partial<TeacherInput>,
  currentUuid?: string,
): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!input.name?.trim()) errors.push({ field: "name", message: "Nome é obrigatório." });
  if (!input.cpf || input.cpf.replace(/\D/g, "").length !== 11) {
    errors.push({ field: "cpf", message: "CPF deve ter 11 dígitos." });
  }
  if (!input.email?.includes("@")) {
    errors.push({ field: "email", message: "E-mail inválido." });
  } else {
    const existing = findUserByEmail(input.email);
    if (existing && existing.uuid !== currentUuid) {
      errors.push({ field: "email", message: "E-mail já cadastrado." });
    }
  }
  if (!input.birthDate) {
    errors.push({ field: "birthDate", message: "Data de nascimento é obrigatória." });
  }
  if (!input.title?.trim()) {
    errors.push({ field: "title", message: "Titulação é obrigatória." });
  }
  if (!departments.some((department) => department.uuid === input.departmentId)) {
    errors.push({ field: "departmentId", message: "Departamento inválido." });
  }
  return errors;
}

export const teacherHandlers = [
  http.get(`${API_BASE}/teachers`, async ({ request }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const filtered = teachers.filter((teacher) =>
      matchesSearch(search, teacher.name, teacher.enrollmentCode, teacher.email),
    );
    return HttpResponse.json(paginate(filtered, url));
  }),

  http.get(`${API_BASE}/teachers/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const teacher = teachers.find((t) => t.uuid === params.id);
    if (!teacher) return notFound("Professor");
    return HttpResponse.json(teacher);
  }),

  http.post(`${API_BASE}/teachers`, async ({ request }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const input = (await request.json()) as TeacherInput;
    const errors = validateTeacherInput(input);
    if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

    const department = departments.find((d) => d.uuid === input.departmentId)!;
    teacherCodeSequence += 1;
    const teacher: Teacher = {
      uuid: nextUuid("teacher"),
      name: input.name.trim(),
      email: input.email.trim(),
      role: "TEACHER",
      enrollmentCode: `PRF-${String(teacherCodeSequence).padStart(4, "0")}`,
      cpf: input.cpf.replace(/\D/g, ""),
      birthDate: input.birthDate,
      title: input.title.trim(),
      department: { uuid: department.uuid, name: department.name },
    };
    teachers.push(teacher);
    return HttpResponse.json(teacher, { status: 201 });
  }),

  http.put(`${API_BASE}/teachers/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const teacher = teachers.find((t) => t.uuid === params.id);
    if (!teacher) return notFound("Professor");

    const input = (await request.json()) as TeacherInput;
    const errors = validateTeacherInput(input, teacher.uuid);
    if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

    const department = departments.find((d) => d.uuid === input.departmentId)!;
    Object.assign(teacher, {
      name: input.name.trim(),
      email: input.email.trim(),
      cpf: input.cpf.replace(/\D/g, ""),
      birthDate: input.birthDate,
      title: input.title.trim(),
      department: { uuid: department.uuid, name: department.name },
    });
    return HttpResponse.json(teacher);
  }),

  http.delete(`${API_BASE}/teachers/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const index = teachers.findIndex((t) => t.uuid === params.id);
    if (index === -1) return notFound("Professor");
    teachers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
