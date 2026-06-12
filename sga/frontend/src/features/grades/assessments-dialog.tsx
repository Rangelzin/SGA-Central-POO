"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useAddAssessment,
  useDeleteAssessment,
  useUpdateAssessment,
} from "@/features/grades/hooks";
import {
  assessmentSchema,
  assessmentTypeLabels,
  assessmentTypeOptions,
  type AssessmentFormValues,
} from "@/features/grades/schemas";
import { weightedAverage } from "@/lib/academic";
import { formatDate, formatGrade } from "@/lib/utils";
import type { Assessment, Enrollment } from "@/types/domain";

const emptyValues: Partial<AssessmentFormValues> = {
  description: "",
  type: undefined,
  grade: undefined,
  weight: undefined,
  date: "",
};

export function AssessmentsDialog({
  enrollment,
  classId,
  open,
  onOpenChange,
}: {
  enrollment: Enrollment;
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [editing, setEditing] = useState<Assessment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<Assessment | null>(null);

  const addAssessment = useAddAssessment(classId);
  const updateAssessment = useUpdateAssessment(classId);
  const deleteAssessment = useDeleteAssessment(classId);

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: emptyValues as AssessmentFormValues,
  });

  const average = weightedAverage(enrollment.assessments);
  const isPending = addAssessment.isPending || updateAssessment.isPending;

  function openCreateForm() {
    setEditing(null);
    form.reset(emptyValues as AssessmentFormValues);
    setShowForm(true);
  }

  function openEditForm(assessment: Assessment) {
    setEditing(assessment);
    form.reset({
      description: assessment.description,
      type: assessment.type,
      grade: assessment.grade,
      weight: assessment.weight,
      date: assessment.date,
    });
    setShowForm(true);
  }

  async function handleSubmit(values: AssessmentFormValues) {
    if (editing) {
      await updateAssessment.mutateAsync({
        enrollmentId: enrollment.uuid,
        assessmentId: editing.uuid,
        input: values,
      });
    } else {
      await addAssessment.mutateAsync({ enrollmentId: enrollment.uuid, input: values });
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleConfirmDelete() {
    if (!toDelete) return;
    deleteAssessment.mutate(
      { enrollmentId: enrollment.uuid, assessmentId: toDelete.uuid },
      { onSuccess: () => setToDelete(null) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Avaliações — {enrollment.student.name}</DialogTitle>
          <DialogDescription>
            A nota consolidada é a média ponderada das avaliações
            {average !== null && (
              <>
                {" "}
                (atual: <strong className="text-foreground">{formatGrade(average)}</strong>)
              </>
            )}
            .
          </DialogDescription>
        </DialogHeader>

        {enrollment.assessments.length === 0 && !showForm ? (
          <EmptyState
            title="Nenhuma avaliação lançada"
            description="Adicione provas, trabalhos e projetos com seus pesos."
            action={
              <Button size="sm" onClick={openCreateForm}>
                <Plus className="size-4" aria-hidden />
                Nova avaliação
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {enrollment.assessments.length > 0 && (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Nota</TableHead>
                      <TableHead className="text-right">Peso</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollment.assessments.map((assessment) => (
                      <TableRow key={assessment.uuid}>
                        <TableCell className="font-medium">
                          {assessment.description}
                        </TableCell>
                        <TableCell>{assessmentTypeLabels[assessment.type]}</TableCell>
                        <TableCell>{formatDate(assessment.date)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatGrade(assessment.grade)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {assessment.weight}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Editar avaliação"
                              onClick={() => openEditForm(assessment)}
                            >
                              <Pencil className="size-4" aria-hidden />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Remover avaliação"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setToDelete(assessment)}
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {showForm ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4 rounded-lg border bg-muted/30 p-4"
                  noValidate
                >
                  <p className="text-sm font-medium">
                    {editing ? "Editar avaliação" : "Nova avaliação"}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Prova 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              {assessmentTypeOptions.map((option) => (
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
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota (0–10)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
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
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0.1}
                              step={0.1}
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
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                      {isPending && (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      )}
                      {editing ? "Salvar" : "Adicionar"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false);
                        setEditing(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Button size="sm" variant="outline" onClick={openCreateForm}>
                <Plus className="size-4" aria-hidden />
                Nova avaliação
              </Button>
            )}
          </div>
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          onOpenChange={(value) => !value && setToDelete(null)}
          title="Remover avaliação"
          description={`Remover "${toDelete?.description}"? A nota consolidada será recalculada.`}
          isPending={deleteAssessment.isPending}
          onConfirm={handleConfirmDelete}
        />
      </DialogContent>
    </Dialog>
  );
}
