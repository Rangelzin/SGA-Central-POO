import { z } from "zod";

export const classSchema = z
  .object({
    code: z.string().min(2, "Informe o código da turma (ex.: CC101-A)."),
    subjectId: z.string().min(1, "Selecione a disciplina."),
    teacherId: z.string().min(1, "Selecione o professor."),
    term: z
      .string()
      .regex(/^\d{4}\.[12]$/, "Use o formato AAAA.S (ex.: 2026.1)."),
    schedule: z.string().min(3, "Informe o horário."),
    location: z.string().min(2, "Informe o local."),
    startDate: z.string().min(1, "Informe a data inicial."),
    endDate: z.string().min(1, "Informe a data final."),
    capacity: z
      .number("Informe a capacidade.")
      .int("Use um número inteiro.")
      .positive("Capacidade deve ser maior que zero."),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: "Data final deve ser após a inicial.",
    path: ["endDate"],
  });

export type ClassFormValues = z.infer<typeof classSchema>;
