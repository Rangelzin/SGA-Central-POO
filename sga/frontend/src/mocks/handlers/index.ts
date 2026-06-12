import { authHandlers } from "@/mocks/handlers/auth";
import { classHandlers } from "@/mocks/handlers/classes";
import { enrollmentHandlers } from "@/mocks/handlers/enrollments";
import { studentHandlers } from "@/mocks/handlers/students";
import { subjectHandlers } from "@/mocks/handlers/subjects";
import { supportHandlers } from "@/mocks/handlers/support";
import { teacherHandlers } from "@/mocks/handlers/teachers";

export const handlers = [
  ...authHandlers,
  ...studentHandlers,
  ...teacherHandlers,
  ...subjectHandlers,
  ...classHandlers,
  ...enrollmentHandlers,
  ...supportHandlers,
];
