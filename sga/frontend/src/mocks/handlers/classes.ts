import { http, HttpResponse } from "msw";
import type { ClassInput, ClassReport } from "@/types/api";
import {
  activeEnrollmentsOf,
  classes,
  enrollments,
  nextUuid,
  serializeClass,
  serializeEnrollment,
  subjects,
  teachers,
  type ClassRecord,
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

function validateClassInput(
  input: Partial<ClassInput>,
  currentUuid?: string,
): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!input.code?.trim()) errors.push({ field: "code", message: "Código é obrigatório." });
  else if (
    classes.some(
      (c) =>
        c.code.toLowerCase() === input.code!.trim().toLowerCase() &&
        c.term === input.term &&
        c.uuid !== currentUuid,
    )
  ) {
    errors.push({ field: "code", message: "Já existe turma com este código no período." });
  }
  if (!subjects.some((s) => s.uuid === input.subjectId)) {
    errors.push({ field: "subjectId", message: "Disciplina inválida." });
  }
  if (!teachers.some((t) => t.uuid === input.teacherId)) {
    errors.push({ field: "teacherId", message: "Professor inválido." });
  }
  if (!input.term?.trim()) errors.push({ field: "term", message: "Período é obrigatório." });
  if (!input.schedule?.trim()) {
    errors.push({ field: "schedule", message: "Horário é obrigatório." });
  }
  if (!input.location?.trim()) {
    errors.push({ field: "location", message: "Local é obrigatório." });
  }
  if (!input.startDate) errors.push({ field: "startDate", message: "Data inicial é obrigatória." });
  if (!input.endDate) errors.push({ field: "endDate", message: "Data final é obrigatória." });
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    errors.push({ field: "endDate", message: "Data final deve ser após a inicial." });
  }
  if (!input.capacity || input.capacity <= 0) {
    errors.push({ field: "capacity", message: "Capacidade deve ser maior que zero." });
  }
  return errors;
}

function applyInput(record: ClassRecord, input: ClassInput): ClassRecord {
  const subject = subjects.find((s) => s.uuid === input.subjectId)!;
  const teacher = teachers.find((t) => t.uuid === input.teacherId)!;
  return Object.assign(record, {
    code: input.code.trim().toUpperCase(),
    subject: {
      uuid: subject.uuid,
      code: subject.code,
      name: subject.name,
      workload: subject.workload,
    },
    teacher: { uuid: teacher.uuid, name: teacher.name },
    term: input.term.trim(),
    schedule: input.schedule.trim(),
    location: input.location.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    capacity: input.capacity,
  });
}

function buildReport(record: ClassRecord): ClassReport {
  const rows = activeEnrollmentsOf(record.uuid).map((enrollment) => {
    const serialized = serializeEnrollment(enrollment);
    return {
      student: serialized.student,
      grade: serialized.grade,
      attendance: serialized.attendance,
      status: serialized.status,
    };
  });

  const graded = rows.filter((row) => row.grade !== null);
  const averageGrade =
    graded.length > 0
      ? Math.round(
          (graded.reduce((sum, row) => sum + (row.grade ?? 0), 0) / graded.length) * 10,
        ) / 10
      : 0;

  return {
    class: {
      uuid: record.uuid,
      code: record.code,
      term: record.term,
      schedule: record.schedule,
    },
    studentsCount: rows.length,
    averageGrade,
    approvedCount: rows.filter((row) => row.status === "APPROVED").length,
    failedCount: rows.filter((row) => row.status === "FAILED").length,
    rows,
  };
}

export const classHandlers = [
  http.get(`${API_BASE}/classes`, async ({ request }) => {
    await networkDelay();
    const user = getCurrentUser(request);
    if (!user) return unauthorized();

    const url = new URL(request.url);
    const term = url.searchParams.get("term");
    const subjectId = url.searchParams.get("subjectId");
    const available = url.searchParams.get("available");
    const search = url.searchParams.get("search");
    let teacherId = url.searchParams.get("teacherId");
    if (teacherId === "me") teacherId = user.uuid;

    const filtered = classes
      .filter((c) => (term ? c.term === term : true))
      .filter((c) => (teacherId ? c.teacher.uuid === teacherId : true))
      .filter((c) => (subjectId ? c.subject.uuid === subjectId : true))
      .filter((c) =>
        matchesSearch(search ?? null, c.code, c.subject.name, c.teacher.name),
      )
      .map(serializeClass)
      .filter((c) => (available === "true" ? c.availableSeats > 0 : true));

    return HttpResponse.json(paginate(filtered, url));
  }),

  http.get(`${API_BASE}/classes/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const record = classes.find((c) => c.uuid === params.id);
    if (!record) return notFound("Turma");
    return HttpResponse.json(serializeClass(record));
  }),

  http.post(`${API_BASE}/classes`, async ({ request }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const input = (await request.json()) as ClassInput;
    const errors = validateClassInput(input);
    if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

    const record = applyInput({ uuid: nextUuid("class") } as ClassRecord, input);
    classes.push(record);
    return HttpResponse.json(serializeClass(record), { status: 201 });
  }),

  http.put(`${API_BASE}/classes/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const record = classes.find((c) => c.uuid === params.id);
    if (!record) return notFound("Turma");

    const input = (await request.json()) as ClassInput;
    const errors = validateClassInput(input, record.uuid);
    if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

    applyInput(record, input);
    return HttpResponse.json(serializeClass(record));
  }),

  http.delete(`${API_BASE}/classes/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const index = classes.findIndex((c) => c.uuid === params.id);
    if (index === -1) return notFound("Turma");

    const [removed] = classes.splice(index, 1);
    for (let i = enrollments.length - 1; i >= 0; i -= 1) {
      if (enrollments[i].classId === removed.uuid) enrollments.splice(i, 1);
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_BASE}/classes/:id/enrollments`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const record = classes.find((c) => c.uuid === params.id);
    if (!record) return notFound("Turma");

    const list = activeEnrollmentsOf(record.uuid).map(serializeEnrollment);
    return HttpResponse.json(list);
  }),

  // RF-07: relatório de desempenho da turma
  http.get(`${API_BASE}/classes/:id/report`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const record = classes.find((c) => c.uuid === params.id);
    if (!record) return notFound("Turma");
    return HttpResponse.json(buildReport(record));
  }),
];
