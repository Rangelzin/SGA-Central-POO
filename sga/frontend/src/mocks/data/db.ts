import type {
  Admin,
  Assessment,
  Class,
  Course,
  Department,
  EnrollmentStatus,
  Person,
  Student,
  Subject,
  Teacher,
} from "@/types/domain";
import { computeEnrollmentStatus, weightedAverage } from "@/lib/academic";

/**
 * "Banco" em memória do MSW. As regras de negócio testáveis
 * (vagas, duplicidade, aprovação) vivem aqui e nos handlers — o
 * mock é o backend durante o desenvolvimento (seção 9.3 do plano).
 */

export const CURRENT_TERM = "2026.1";
export const MOCK_PASSWORD = "123456";

// ─── Apoio ────────────────────────────────────────────────────────────────

export const departments: Department[] = [
  { uuid: "dep-1", acronym: "DCC", name: "Departamento de Ciência da Computação" },
  { uuid: "dep-2", acronym: "DMA", name: "Departamento de Matemática" },
  { uuid: "dep-3", acronym: "DFI", name: "Departamento de Física" },
  { uuid: "dep-4", acronym: "DLE", name: "Departamento de Letras" },
];

export const courses: Course[] = [
  { uuid: "course-1", acronym: "CC", name: "Ciência da Computação" },
  { uuid: "course-2", acronym: "SI", name: "Sistemas de Informação" },
  { uuid: "course-3", acronym: "EC", name: "Engenharia de Computação" },
  { uuid: "course-4", acronym: "MAT", name: "Matemática" },
];

const courseRef = (uuid: string) => {
  const course = courses.find((c) => c.uuid === uuid)!;
  return { uuid: course.uuid, name: course.name };
};

const departmentRef = (uuid: string) => {
  const department = departments.find((d) => d.uuid === uuid)!;
  return { uuid: department.uuid, name: department.name };
};

// ─── Pessoas ──────────────────────────────────────────────────────────────

export const admins: Admin[] = [
  {
    uuid: "admin-1",
    name: "Ana Souza",
    email: "admin@sga.edu.br",
    role: "ADMIN",
    enrollmentCode: "ADM-0001",
    cpf: "39053344705",
    birthDate: "1985-04-12",
  },
];

export const teachers: Teacher[] = [
  {
    uuid: "teacher-1",
    name: "Carlos Lima",
    email: "professor@sga.edu.br",
    role: "TEACHER",
    enrollmentCode: "PRF-0001",
    cpf: "52998224725",
    birthDate: "1978-09-03",
    title: "Doutor",
    department: departmentRef("dep-1"),
  },
  {
    uuid: "teacher-2",
    name: "Mariana Alves",
    email: "mariana.alves@sga.edu.br",
    role: "TEACHER",
    enrollmentCode: "PRF-0002",
    cpf: "11144477735",
    birthDate: "1984-02-17",
    title: "Mestre",
    department: departmentRef("dep-1"),
  },
  {
    uuid: "teacher-3",
    name: "Roberto Dias",
    email: "roberto.dias@sga.edu.br",
    role: "TEACHER",
    enrollmentCode: "PRF-0003",
    cpf: "74185296305",
    birthDate: "1971-11-25",
    title: "Doutor",
    department: departmentRef("dep-2"),
  },
  {
    uuid: "teacher-4",
    name: "Fernanda Castro",
    email: "fernanda.castro@sga.edu.br",
    role: "TEACHER",
    enrollmentCode: "PRF-0004",
    cpf: "95125363710",
    birthDate: "1980-06-30",
    title: "Doutora",
    department: departmentRef("dep-3"),
  },
  {
    uuid: "teacher-5",
    name: "Paulo Mendes",
    email: "paulo.mendes@sga.edu.br",
    role: "TEACHER",
    enrollmentCode: "PRF-0005",
    cpf: "35715926803",
    birthDate: "1988-01-09",
    title: "Especialista",
    department: departmentRef("dep-1"),
  },
  {
    uuid: "teacher-6",
    name: "Juliana Rocha",
    email: "juliana.rocha@sga.edu.br",
    role: "TEACHER",
    enrollmentCode: "PRF-0006",
    cpf: "15935785202",
    birthDate: "1990-08-21",
    title: "Mestre",
    department: departmentRef("dep-4"),
  },
];

const studentSeed: [string, string, string, string][] = [
  // [nome, email, dataNascimento, courseId]
  ["Bruno Ferreira", "aluno@sga.edu.br", "2005-03-14", "course-1"],
  ["Larissa Martins", "larissa.martins@sga.edu.br", "2004-07-22", "course-1"],
  ["Gabriel Santos", "gabriel.santos@sga.edu.br", "2005-12-01", "course-2"],
  ["Isabela Costa", "isabela.costa@sga.edu.br", "2006-02-09", "course-1"],
  ["Lucas Oliveira", "lucas.oliveira@sga.edu.br", "2004-10-30", "course-3"],
  ["Camila Ribeiro", "camila.ribeiro@sga.edu.br", "2005-05-18", "course-2"],
  ["Mateus Pereira", "mateus.pereira@sga.edu.br", "2006-01-27", "course-1"],
  ["Beatriz Carvalho", "beatriz.carvalho@sga.edu.br", "2005-08-05", "course-4"],
  ["Rafael Gomes", "rafael.gomes@sga.edu.br", "2004-04-16", "course-3"],
  ["Júlia Fernandes", "julia.fernandes@sga.edu.br", "2005-09-23", "course-1"],
  ["Thiago Barbosa", "thiago.barbosa@sga.edu.br", "2006-06-11", "course-2"],
  ["Amanda Nunes", "amanda.nunes@sga.edu.br", "2005-11-08", "course-4"],
  ["Felipe Araújo", "felipe.araujo@sga.edu.br", "2004-12-19", "course-1"],
  ["Letícia Moreira", "leticia.moreira@sga.edu.br", "2006-03-02", "course-3"],
  ["Vinícius Cardoso", "vinicius.cardoso@sga.edu.br", "2005-01-15", "course-2"],
];

export const students: Student[] = studentSeed.map(
  ([name, email, birthDate, courseId], index) => ({
    uuid: `student-${index + 1}`,
    name,
    email,
    role: "STUDENT",
    enrollmentCode: `2026${String(1001 + index)}`,
    cpf: String(10000000000 + index * 1234567).slice(0, 11),
    birthDate,
    course: courseRef(courseId),
  }),
);

/** Credenciais mock: todos os usuários usam a mesma senha (documentada no README). */
export function findUserByEmail(email: string): Person | undefined {
  return [...admins, ...teachers, ...students].find(
    (person) => person.email.toLowerCase() === email.toLowerCase(),
  );
}

export function findUserByUuid(uuid: string): Person | undefined {
  return [...admins, ...teachers, ...students].find((person) => person.uuid === uuid);
}

// ─── Disciplinas ──────────────────────────────────────────────────────────

const teacherRef = (uuid: string) => {
  const teacher = teachers.find((t) => t.uuid === uuid)!;
  return { uuid: teacher.uuid, name: teacher.name };
};

export const subjects: Subject[] = [
  {
    uuid: "subject-1",
    code: "CC101",
    name: "Algoritmos e Programação",
    syllabus: "Lógica de programação, estruturas de controle, funções e vetores.",
    workload: 60,
    type: "MANDATORY",
    responsibleTeacher: teacherRef("teacher-1"),
    active: true,
  },
  {
    uuid: "subject-2",
    code: "CC102",
    name: "Programação Orientada a Objetos",
    syllabus: "Classes, herança, polimorfismo, interfaces e boas práticas.",
    workload: 60,
    type: "MANDATORY",
    prerequisite: "CC101",
    responsibleTeacher: teacherRef("teacher-2"),
    active: true,
  },
  {
    uuid: "subject-3",
    code: "CC201",
    name: "Estruturas de Dados",
    syllabus: "Listas, pilhas, filas, árvores, grafos e análise de complexidade.",
    workload: 60,
    type: "MANDATORY",
    prerequisite: "CC102",
    responsibleTeacher: teacherRef("teacher-1"),
    active: true,
  },
  {
    uuid: "subject-4",
    code: "CC301",
    name: "Banco de Dados",
    syllabus: "Modelagem relacional, SQL, normalização e transações.",
    workload: 60,
    type: "MANDATORY",
    prerequisite: "CC201",
    responsibleTeacher: teacherRef("teacher-5"),
    active: true,
  },
  {
    uuid: "subject-5",
    code: "MA101",
    name: "Cálculo I",
    syllabus: "Limites, derivadas, integrais e aplicações.",
    workload: 90,
    type: "MANDATORY",
    responsibleTeacher: teacherRef("teacher-3"),
    active: true,
  },
  {
    uuid: "subject-6",
    code: "FI101",
    name: "Física I",
    syllabus: "Cinemática, dinâmica, trabalho e energia.",
    workload: 60,
    type: "ELECTIVE",
    responsibleTeacher: teacherRef("teacher-4"),
    active: true,
  },
  {
    uuid: "subject-7",
    code: "LE101",
    name: "Inglês Instrumental",
    syllabus: "Leitura e interpretação de textos técnicos em inglês.",
    workload: 30,
    type: "FREE",
    responsibleTeacher: teacherRef("teacher-6"),
    active: true,
  },
  {
    uuid: "subject-8",
    code: "CC401",
    name: "Inteligência Artificial",
    syllabus: "Busca, aprendizado de máquina e redes neurais.",
    workload: 60,
    type: "ELECTIVE",
    prerequisite: "CC201",
    responsibleTeacher: null, // sem professor → não pode ser ativada (RF-03)
    active: false,
  },
];

// ─── Turmas ───────────────────────────────────────────────────────────────

/** Turma persistida sem os campos calculados (enrolledCount/availableSeats). */
export type ClassRecord = Omit<Class, "enrolledCount" | "availableSeats">;

const subjectRef = (uuid: string) => {
  const subject = subjects.find((s) => s.uuid === uuid)!;
  return {
    uuid: subject.uuid,
    code: subject.code,
    name: subject.name,
    workload: subject.workload,
  };
};

export const classes: ClassRecord[] = [
  {
    uuid: "class-1",
    code: "CC102-A",
    subject: subjectRef("subject-2"),
    teacher: teacherRef("teacher-2"),
    term: CURRENT_TERM,
    schedule: "Seg/Qua 08:00–10:00",
    location: "Sala 101",
    startDate: "2026-03-02",
    endDate: "2026-07-10",
    capacity: 5, // turma pequena de propósito: exercita o 409 de "sem vagas"
  },
  {
    uuid: "class-2",
    code: "CC101-A",
    subject: subjectRef("subject-1"),
    teacher: teacherRef("teacher-1"),
    term: CURRENT_TERM,
    schedule: "Ter/Qui 10:00–12:00",
    location: "Sala 102",
    startDate: "2026-03-02",
    endDate: "2026-07-10",
    capacity: 40,
  },
  {
    uuid: "class-3",
    code: "CC201-A",
    subject: subjectRef("subject-3"),
    teacher: teacherRef("teacher-1"),
    term: CURRENT_TERM,
    schedule: "Seg/Qua 10:00–12:00",
    location: "Laboratório 2",
    startDate: "2026-03-02",
    endDate: "2026-07-10",
    capacity: 30,
  },
  {
    uuid: "class-4",
    code: "MA101-A",
    subject: subjectRef("subject-5"),
    teacher: teacherRef("teacher-3"),
    term: CURRENT_TERM,
    schedule: "Ter/Qui 08:00–10:00",
    location: "Sala 201",
    startDate: "2026-03-02",
    endDate: "2026-07-10",
    capacity: 50,
  },
  {
    uuid: "class-5",
    code: "CC301-A",
    subject: subjectRef("subject-4"),
    teacher: teacherRef("teacher-5"),
    term: CURRENT_TERM,
    schedule: "Sex 08:00–12:00",
    location: "Laboratório 1",
    startDate: "2026-03-02",
    endDate: "2026-07-10",
    capacity: 35,
  },
  {
    uuid: "class-6",
    code: "FI101-A",
    subject: subjectRef("subject-6"),
    teacher: teacherRef("teacher-4"),
    term: CURRENT_TERM,
    schedule: "Qua/Sex 14:00–16:00",
    location: "Sala 301",
    startDate: "2026-03-02",
    endDate: "2026-07-10",
    capacity: 30,
  },
  {
    uuid: "class-7",
    code: "CC101-B",
    subject: subjectRef("subject-1"),
    teacher: teacherRef("teacher-1"),
    term: "2025.2",
    schedule: "Ter/Qui 10:00–12:00",
    location: "Sala 102",
    startDate: "2025-08-04",
    endDate: "2025-12-12",
    capacity: 40,
  },
];

// ─── Matrículas ───────────────────────────────────────────────────────────

/** Matrícula persistida com ids (refs são resolvidas na serialização). */
export interface EnrollmentRecord {
  uuid: string;
  studentId: string;
  classId: string;
  grade: number | null;
  attendance: number | null;
  status: EnrollmentStatus;
  assessments: Assessment[];
}

export const computeStatus = computeEnrollmentStatus;
export { weightedAverage };

let enrollmentSequence = 0;

function seedEnrollment(
  studentId: string,
  classId: string,
  grade: number | null,
  attendance: number | null,
  assessments: Assessment[] = [],
): EnrollmentRecord {
  enrollmentSequence += 1;
  return {
    uuid: `enrollment-${enrollmentSequence}`,
    studentId,
    classId,
    grade,
    attendance,
    status: computeStatus(grade, attendance),
    assessments,
  };
}

let assessmentSequence = 0;

function seedAssessment(
  description: string,
  type: Assessment["type"],
  grade: number,
  weight: number,
  date: string,
): Assessment {
  assessmentSequence += 1;
  return { uuid: `assessment-${assessmentSequence}`, description, type, grade, weight, date };
}

export const enrollments: EnrollmentRecord[] = [
  // 2025.2 — histórico do aluno demo (class-7, CC101 concluída)
  seedEnrollment("student-1", "class-7", 8.5, 92, [
    seedAssessment("Prova 1", "EXAM", 8.0, 4, "2025-10-01"),
    seedAssessment("Prova 2", "EXAM", 8.8, 6, "2025-11-26"),
  ]),
  seedEnrollment("student-2", "class-7", 5.4, 88),
  seedEnrollment("student-9", "class-7", 9.2, 97),

  // class-1 (POO, capacidade 5) — LOTADA: matrícula nela retorna 409
  seedEnrollment("student-1", "class-1", null, 90),
  seedEnrollment("student-2", "class-1", 7.0, null),
  seedEnrollment("student-3", "class-1", null, null),
  seedEnrollment("student-4", "class-1", null, 85),
  seedEnrollment("student-5", "class-1", null, null),

  // class-2 (CC101, prof. demo) — notas variadas p/ exercitar badges
  seedEnrollment("student-6", "class-2", 9.0, 95, [
    seedAssessment("Prova 1", "EXAM", 9.5, 4, "2026-04-15"),
    seedAssessment("Trabalho prático", "ASSIGNMENT", 8.7, 6, "2026-05-20"),
  ]),
  seedEnrollment("student-7", "class-2", 4.5, 80), // reprovado por nota
  seedEnrollment("student-8", "class-2", 7.0, 60), // reprovado por frequência
  seedEnrollment("student-9", "class-2", null, 88),
  seedEnrollment("student-10", "class-2", null, null),

  // class-3 (Estruturas de Dados, prof. demo) — em andamento
  seedEnrollment("student-1", "class-3", null, 80),
  seedEnrollment("student-2", "class-3", 6.5, null),
  seedEnrollment("student-3", "class-3", null, null),

  // class-4 (Cálculo I)
  seedEnrollment("student-4", "class-4", 6.0, 75), // aprovado no limite exato
  seedEnrollment("student-6", "class-4", 5.9, 90), // reprovado por 0.1
  seedEnrollment("student-11", "class-4", null, 70), // frequência baixa em andamento
  seedEnrollment("student-12", "class-4", null, null),

  // class-5 (Banco de Dados)
  seedEnrollment("student-13", "class-5", 8.2, 100),
  seedEnrollment("student-14", "class-5", null, null),
  seedEnrollment("student-15", "class-5", null, 78),

  // class-6 (Física I)
  seedEnrollment("student-11", "class-6", null, null),
  seedEnrollment("student-12", "class-6", 7.7, 82),
];

// ─── Geração de ids/códigos ───────────────────────────────────────────────

export function nextUuid(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

let enrollmentCodeSequence = 1016;

/** enrollmentCode é gerado pelo "backend" (RF-01). */
export function nextEnrollmentCode(): string {
  enrollmentCodeSequence += 1;
  return `2026${enrollmentCodeSequence}`;
}

// ─── Serialização ─────────────────────────────────────────────────────────

export function activeEnrollmentsOf(classId: string): EnrollmentRecord[] {
  return enrollments.filter(
    (enrollment) => enrollment.classId === classId && enrollment.status !== "CANCELLED",
  );
}

export function serializeClass(record: ClassRecord): Class {
  const enrolledCount = activeEnrollmentsOf(record.uuid).length;
  return {
    ...record,
    enrolledCount,
    availableSeats: Math.max(record.capacity - enrolledCount, 0),
  };
}

export function serializeEnrollment(record: EnrollmentRecord) {
  const student = students.find((s) => s.uuid === record.studentId);
  const classRecord = classes.find((c) => c.uuid === record.classId);
  return {
    uuid: record.uuid,
    student: student
      ? { uuid: student.uuid, name: student.name, enrollmentCode: student.enrollmentCode }
      : { uuid: record.studentId, name: "Aluno removido", enrollmentCode: "—" },
    class: classRecord
      ? {
          uuid: classRecord.uuid,
          code: classRecord.code,
          term: classRecord.term,
          schedule: classRecord.schedule,
        }
      : { uuid: record.classId, code: "—", term: "—", schedule: "—" },
    grade: record.grade,
    attendance: record.attendance,
    status: record.status,
    assessments: record.assessments,
  };
}
