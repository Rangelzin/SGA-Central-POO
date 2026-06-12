"use client";

import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useSubjects } from "@/features/subjects/hooks";
import { useTeachers } from "@/features/teachers/hooks";
import { classSchema, type ClassFormValues } from "@/features/classes/schemas";
import { getApiFieldErrors } from "@/lib/api/client";
import { CURRENT_TERM } from "@/lib/constants";
import type { Class } from "@/types/domain";

export function ClassForm({
  classItem,
  onSubmit,
  isPending,
}: {
  classItem?: Class;
  onSubmit: (values: ClassFormValues) => Promise<unknown>;
  isPending: boolean;
}) {
  const subjects = useSubjects({ page: 0, size: 100 });
  const teachers = useTeachers({ page: 0, size: 100 });

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      code: classItem?.code ?? "",
      subjectId: classItem?.subject.uuid ?? "",
      teacherId: classItem?.teacher.uuid ?? "",
      term: classItem?.term ?? CURRENT_TERM,
      schedule: classItem?.schedule ?? "",
      location: classItem?.location ?? "",
      startDate: classItem?.startDate ?? "",
      endDate: classItem?.endDate ?? "",
      capacity: classItem?.capacity,
    },
  });

  async function handleSubmit(values: ClassFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      for (const fieldError of getApiFieldErrors(error)) {
        form.setError(fieldError.field as Path<ClassFormValues>, {
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
                <FormLabel>Código da turma</FormLabel>
                <FormControl>
                  <Input placeholder="CC101-A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="term"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Período letivo</FormLabel>
                <FormControl>
                  <Input placeholder="2026.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disciplina</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(subjects.data?.content ?? []).map((subject) => (
                    <SelectItem key={subject.uuid} value={subject.uuid}>
                      {subject.code} — {subject.name}
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
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o professor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(teachers.data?.content ?? []).map((teacher) => (
                    <SelectItem key={teacher.uuid} value={teacher.uuid}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input placeholder="Seg/Qua 08:00–10:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local</FormLabel>
                <FormControl>
                  <Input placeholder="Sala 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fim</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vagas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="40"
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

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {classItem ? "Salvar alterações" : "Criar turma"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
