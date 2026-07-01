"use client";

import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourses } from "@/features/support/hooks";
import { studentSchema, type StudentFormValues } from "@/features/students/schemas";
import { getApiFieldErrors } from "@/lib/api/client";
import { formatCpf } from "@/lib/utils";
import type { Student } from "@/types/domain";

export function StudentForm({
  student,
  onSubmit,
  isPending,
}: {
  student?: Student;
  onSubmit: (values: StudentFormValues) => Promise<unknown>;
  isPending: boolean;
}) {
  const courses = useCourses();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name ?? "",
      cpf: student ? formatCpf(student.cpf) : "",
      birthDate: student?.birthDate ?? "",
      email: student?.email ?? "",
      courseId: student?.course.uuid ?? "",
    },
  });

  async function handleSubmit(values: StudentFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      // 400 da API → erros nos campos correspondentes
      for (const fieldError of getApiFieldErrors(error)) {
        form.setError(fieldError.field as Path<StudentFormValues>, {
          message: fieldError.message,
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="max-w-xl space-y-4"
        noValidate
      >
        {student && (
          <FormItem>
            <FormLabel>Matrícula</FormLabel>
            <FormControl>
              <Input value={student.enrollmentCode} readOnly disabled />
            </FormControl>
            <FormDescription>Gerada automaticamente pelo sistema.</FormDescription>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Maria da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    {...field}
                    onChange={(event) => field.onChange(formatCpf(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="maria@sga.edu.br" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(courses.data ?? []).map((course) => (
                    <SelectItem key={course.uuid} value={course.uuid}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {student ? "Salvar alterações" : "Criar aluno"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
