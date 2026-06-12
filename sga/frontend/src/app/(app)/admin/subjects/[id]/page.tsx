"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { SubjectForm } from "@/features/subjects/subject-form";
import { useSubject, useUpdateSubject } from "@/features/subjects/hooks";
import type { SubjectFormValues } from "@/features/subjects/schemas";

export default function EditSubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const subject = useSubject(id);
  const updateSubject = useUpdateSubject(id);

  async function handleSubmit(values: SubjectFormValues) {
    await updateSubject.mutateAsync(values);
    router.push("/admin/subjects");
  }

  if (subject.isLoading) return <LoadingState />;
  if (subject.isError || !subject.data) {
    return (
      <ErrorState
        message="Disciplina não encontrada."
        onRetry={() => subject.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${subject.data.code} — ${subject.data.name}`}
        action={
          subject.data.active ? (
            <Badge className="border-transparent bg-success/15 text-success">Ativa</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Inativa
            </Badge>
          )
        }
      />
      <SubjectForm
        subject={subject.data}
        onSubmit={handleSubmit}
        isPending={updateSubject.isPending}
      />
    </div>
  );
}
