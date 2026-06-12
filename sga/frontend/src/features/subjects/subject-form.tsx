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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeachers } from "@/features/teachers/hooks";
import {
  subjectSchema,
  subjectTypeOptions,
  type SubjectFormValues,
} from "@/features/subjects/schemas";
import { getApiFieldErrors } from "@/lib/api/client";
import type { Subject } from "@/types/domain";

const NO_TEACHER = "none";

export function SubjectForm({
  subject,
  onSubmit,
  isPending,
}: {
  subject?: Subject;
  onSubmit: (values: SubjectFormValues) => Promise<unknown>;
  isPending: boolean;
}) {
  const teachers = useTeachers({ page: 0, size: 100 });

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      code: subject?.code ?? "",
      name: subject?.name ?? "",
      syllabus: subject?.syllabus ?? "",
      workload: subject?.workload,
      type: subject?.type,
      prerequisite: subject?.prerequisite ?? "",
      responsibleTeacherId: subject?.responsibleTeacher?.uuid,
    },
  });

  async function handleSubmit(values: SubjectFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      for (const fieldError of getApiFieldErrors(error)) {
        form.setError(fieldError.field as Path<SubjectFormValues>, {
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="CC101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="workload"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carga horária (h)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="60"
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber;
                      field.onChange(Number.isNaN(value) ? undefined : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Programação Orientada a Objetos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="syllabus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ementa</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Conteúdo programático da disciplina…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjectTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="prerequisite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pré-requisito</FormLabel>
                <FormControl>
                  <Input placeholder="CC101 (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="responsibleTeacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professor responsável</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === NO_TEACHER ? undefined : value)
                }
                value={field.value ?? NO_TEACHER}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_TEACHER}>Sem professor definido</SelectItem>
                  {(teachers.data?.content ?? []).map((teacher) => (
                    <SelectItem key={teacher.uuid} value={teacher.uuid}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                A disciplina só pode ser ativada com um professor responsável (RF-03).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {subject ? "Salvar alterações" : "Criar disciplina"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
