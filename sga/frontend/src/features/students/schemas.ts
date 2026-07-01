import { z } from "zod";
import { stripCpf } from "@/lib/utils";

export const studentSchema = z.object({
  name: z.string().min(3, "Informe o nome completo."),
  cpf: z
    .string()
    .refine((value) => stripCpf(value).length === 11, "CPF deve ter 11 dígitos."),
  birthDate: z.string().min(1, "Informe a data de nascimento."),
  email: z.email("Informe um e-mail válido."),
  senha: z.string().optional(),
  courseId: z.string().min(1, "Selecione o curso."),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
