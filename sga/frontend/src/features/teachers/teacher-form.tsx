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
import { useDepartments } from "@/features/support/hooks";
import { teacherSchema, type TeacherFormValues } from "@/features/teachers/schemas";
import { getApiFieldErrors } from "@/lib/api/client";
import { formatCpf } from "@/lib/utils";
import type { Teacher } from "@/types/domain";

const titleOptions = ["Graduado", "Especialista", "Mestre", "Doutor", "Doutora"];

export function TeacherForm({
  teacher,
  onSubmit,
  isPending,
}: {
  teacher?: Teacher;
  onSubmit: (values: TeacherFormValues) => Promise<unknown>;
  isPending: boolean;
}) {
  const departments = useDepartments();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: teacher?.name ?? "",
      cpf: teacher ? formatCpf(teacher.cpf) : "",
      birthDate: teacher?.birthDate ?? "",
      email: teacher?.email ?? "",
      title: teacher?.title ?? "",
      departmentId: teacher?.department.uuid ?? "",
    },
  });

  async function handleSubmit(values: TeacherFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      for (const fieldError of getApiFieldErrors(error)) {
        form.setError(fieldError.field as Path<TeacherFormValues>, {
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
        {teacher && (
          <FormItem>
            <FormLabel>Registro</FormLabel>
            <FormControl>
              <Input value={teacher.enrollmentCode} readOnly disabled />
            </FormControl>
            <FormDescription>Gerado automaticamente pelo sistema.</FormDescription>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="João Pereira" {...field} />
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
                <Input type="email" placeholder="joao@sga.edu.br" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titulação</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {titleOptions.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(departments.data ?? []).map((department) => (
                      <SelectItem key={department.uuid} value={department.uuid}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {teacher ? "Salvar alterações" : "Criar professor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
