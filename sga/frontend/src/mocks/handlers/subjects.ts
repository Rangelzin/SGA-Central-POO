import { http, HttpResponse } from "msw";
import type { SubjectInput } from "@/types/api";
import type { Subject } from "@/types/domain";
import { nextUuid, subjects, teachers } from "@/mocks/data/db";
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

function validateSubjectInput(
  input: Partial<SubjectInput>,
  currentUuid?: string,
): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!input.code?.trim()) errors.push({ field: "code", message: "Código é obrigatório." });
  else if (
    subjects.some(
      (subject) =>
        subject.code.toLowerCase() === input.code!.trim().toLowerCase() &&
        subject.uuid !== currentUuid,
    )
  ) {
    errors.push({ field: "code", message: "Já existe disciplina com este código." });
  }
  if (!input.name?.trim()) errors.push({ field: "name", message: "Nome é obrigatório." });
  if (!input.syllabus?.trim()) {
    errors.push({ field: "syllabus", message: "Ementa é obrigatória." });
  }
  if (!input.workload || input.workload <= 0) {
    errors.push({ field: "workload", message: "Carga horária deve ser maior que zero." });
  }
  if (input.responsibleTeacherId && !teachers.some((t) => t.uuid === input.responsibleTeacherId)) {
    errors.push({ field: "responsibleTeacherId", message: "Professor inválido." });
  }
  return errors;
}

function resolveTeacherRef(teacherId: string | undefined) {
  if (!teacherId) return null;
  const teacher = teachers.find((t) => t.uuid === teacherId);
  return teacher ? { uuid: teacher.uuid, name: teacher.name } : null;
}

export const subjectHandlers = [
  http.get(`${API_BASE}/subjects`, async ({ request }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const filtered = subjects.filter((subject) =>
      matchesSearch(search, subject.name, subject.code),
    );
    return HttpResponse.json(paginate(filtered, url));
  }),

  http.get(`${API_BASE}/subjects/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const subject = subjects.find((s) => s.uuid === params.id);
    if (!subject) return notFound("Disciplina");
    return HttpResponse.json(subject);
  }),

  http.post(`${API_BASE}/subjects`, async ({ request }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const input = (await request.json()) as SubjectInput;
    const errors = validateSubjectInput(input);
    if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

    const subject: Subject = {
      uuid: nextUuid("subject"),
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      syllabus: input.syllabus.trim(),
      workload: input.workload,
      type: input.type,
      prerequisite: input.prerequisite?.trim() || undefined,
      responsibleTeacher: resolveTeacherRef(input.responsibleTeacherId),
      active: false, // nasce inativa; ativação é ação explícita (RF-03)
    };
    subjects.push(subject);
    return HttpResponse.json(subject, { status: 201 });
  }),

  http.put(`${API_BASE}/subjects/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const subject = subjects.find((s) => s.uuid === params.id);
    if (!subject) return notFound("Disciplina");

    const input = (await request.json()) as SubjectInput;
    const errors = validateSubjectInput(input, subject.uuid);
    if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

    const responsibleTeacher = resolveTeacherRef(input.responsibleTeacherId);
    Object.assign(subject, {
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      syllabus: input.syllabus.trim(),
      workload: input.workload,
      type: input.type,
      prerequisite: input.prerequisite?.trim() || undefined,
      responsibleTeacher,
      // RF-03: sem professor responsável a disciplina não permanece ativa
      active: responsibleTeacher ? subject.active : false,
    });
    return HttpResponse.json(subject);
  }),

  http.post(`${API_BASE}/subjects/:id/activate`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const subject = subjects.find((s) => s.uuid === params.id);
    if (!subject) return notFound("Disciplina");

    if (!subject.responsibleTeacher) {
      return jsonError(
        400,
        "Defina um professor responsável antes de ativar a disciplina.",
      );
    }
    subject.active = true;
    return HttpResponse.json(subject);
  }),

  http.delete(`${API_BASE}/subjects/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const index = subjects.findIndex((s) => s.uuid === params.id);
    if (index === -1) return notFound("Disciplina");
    subjects.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
