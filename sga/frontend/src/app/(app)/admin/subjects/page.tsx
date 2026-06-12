"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getSubjectColumns } from "@/features/subjects/columns";
import {
  useActivateSubject,
  useDeleteSubject,
  useSubjects,
} from "@/features/subjects/hooks";
import { PAGE_SIZE } from "@/lib/constants";
import type { Subject } from "@/types/domain";

export default function SubjectsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const subjects = useSubjects({ page, size: PAGE_SIZE, search });
  const deleteSubject = useDeleteSubject();
  const activateSubject = useActivateSubject();

  const columns = useMemo(
    () =>
      getSubjectColumns({
        onDelete: setSubjectToDelete,
        onActivate: (subject) => activateSubject.mutate(subject.uuid),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function handleConfirmDelete() {
    if (!subjectToDelete) return;
    deleteSubject.mutate(subjectToDelete.uuid, {
      onSuccess: () => setSubjectToDelete(null),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disciplinas"
        description="Gerencie o catálogo de disciplinas (RF-03)."
        action={
          <Button asChild>
            <Link href="/admin/subjects/new">
              <Plus className="size-4" aria-hidden />
              Nova disciplina
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={subjects.data?.content}
        isLoading={subjects.isLoading}
        isError={subjects.isError}
        onRetry={() => subjects.refetch()}
        page={page}
        totalPages={subjects.data?.totalPages ?? 0}
        totalElements={subjects.data?.totalElements ?? 0}
        onPageChange={setPage}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        searchPlaceholder="Buscar por nome ou código"
        emptyTitle="Nenhuma disciplina encontrada"
        emptyDescription={
          search
            ? "Ajuste a busca e tente novamente."
            : "Cadastre a primeira disciplina para começar."
        }
        emptyAction={
          !search && (
            <Button asChild size="sm">
              <Link href="/admin/subjects/new">Nova disciplina</Link>
            </Button>
          )
        }
      />

      <ConfirmDialog
        open={Boolean(subjectToDelete)}
        onOpenChange={(open) => !open && setSubjectToDelete(null)}
        title="Remover disciplina"
        description={`Tem certeza que deseja remover ${subjectToDelete?.name}?`}
        isPending={deleteSubject.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
