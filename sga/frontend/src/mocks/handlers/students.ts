import { http, HttpResponse } from "msw";
import type { StudentInput, Transcript } from "@/types/api";
import type { Student } from "@/types/domain";
import {
  classes,
  courses,
  enrollments,
  findUserByEmail,
  nextEnrollmentCode,
  nextUuid,
  serializeEnrollment,
  students,
  subjects,
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

function validateStudentInput(
  input: Partial<StudentInput>,
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
  if (!courses.some((course) => course.uuid === input.courseId)) {
    errors.push({ field: "courseId", message: "Curso inválido." });
  }
  return errors;
}

function buildTranscript(student: Student): Transcript {
  const rows = enrollments
    .filter((e) => e.studentId === student.uuid && e.status !== "CANCELLED")
    .map((e) => {
      const classRecord = classes.find((c) => c.uuid === e.classId);
      const subject = subjects.find((s) => s.uuid === classRecord?.subject.uuid);
      return {
        subject: subject
          ? {
              uuid: subject.uuid,
              code: subject.code,
              name: subject.name,
              workload: subject.workload,
            }
          : { uuid: "?", code: "—", name: "Disciplina removida", workload: 0 },
        class: classRecord
          ? {
              uuid: classRecord.uuid,
              code: classRecord.code,
              term: classRecord.term,
              schedule: classRecord.schedule,
            }
          : { uuid: "?", code: "—", term: "—", schedule: "—" },
        grade: e.grade,
        attendance: e.attendance,
        status: e.status,
      };
    })
    .sort((a, b) => a.class.term.localeCompare(b.class.term));

  const completed = rows.filter((row) => row.status === "APPROVED");
  const graded = rows.filter((row) => row.grade !== null);
  const overallAverage =
    graded.length > 0
      ? Math.round(
          (graded.reduce((sum, row) => sum + (row.grade ?? 0), 0) / graded.length) * 10,
        ) / 10
      : null;

  return {
    student: {
      uuid: student.uuid,
      name: student.name,
      enrollmentCode: student.enrollmentCode,
    },
    rows,
    completedWorkload: completed.reduce((sum, row) => sum + row.subject.workload, 0),
    overallAverage,
  };
}

export const studentHandlers = [
  http.get(`${API_BASE}/students`, async ({ request }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const filtered = students.filter((student) =>
      matchesSearch(search, student.name, student.enrollmentCode, student.email),
    );
    return HttpResponse.json(paginate(filtered, url));
  }),

  http.get(`${API_BASE}/students/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const student = students.find((s) => s.uuid === params.id);
    if (!student) return notFound("Aluno");
    return HttpResponse.json(student);
  }),

  http.post(`${API_BASE}/students`, async ({ request }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const input = (await request.json()) as StudentInput;
    const errors = validateStudentInput(input);
    if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

    const course = courses.find((c) => c.uuid === input.courseId)!;
    const student: Student = {
      uuid: nextUuid("student"),
      name: input.name.trim(),
      email: input.email.trim(),
      role: "STUDENT",
      enrollmentCode: nextEnrollmentCode(),
      cpf: input.cpf.replace(/\D/g, ""),
      birthDate: input.birthDate,
      course: { uuid: course.uuid, name: course.name },
    };
    students.push(student);
    return HttpResponse.json(student, { status: 201 });
  }),

  http.put(`${API_BASE}/students/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const student = students.find((s) => s.uuid === params.id);
    if (!student) return notFound("Aluno");

    const input = (await request.json()) as StudentInput;
    const errors = validateStudentInput(input, student.uuid);
    if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

    const course = courses.find((c) => c.uuid === input.courseId)!;
    Object.assign(student, {
      name: input.name.trim(),
      email: input.email.trim(),
      cpf: input.cpf.replace(/\D/g, ""),
      birthDate: input.birthDate,
      course: { uuid: course.uuid, name: course.name },
    });
    return HttpResponse.json(student);
  }),

  http.delete(`${API_BASE}/students/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const index = students.findIndex((s) => s.uuid === params.id);
    if (index === -1) return notFound("Aluno");

    const [removed] = students.splice(index, 1);
    for (let i = enrollments.length - 1; i >= 0; i -= 1) {
      if (enrollments[i].studentId === removed.uuid) enrollments.splice(i, 1);
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // RF-06: histórico escolar consolidado
  http.get(`${API_BASE}/students/:id/transcript`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const student = students.find((s) => s.uuid === params.id);
    if (!student) return notFound("Aluno");
    return HttpResponse.json(buildTranscript(student));
  }),

  http.get(`${API_BASE}/students/:id/enrollments`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const student = students.find((s) => s.uuid === params.id);
    if (!student) return notFound("Aluno");

    const list = enrollments
      .filter((e) => e.studentId === student.uuid)
      .map(serializeEnrollment);
    return HttpResponse.json(list);
  }),
];
