"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getClassColumns } from "@/features/classes/columns";
import { useClasses, useDeleteClass } from "@/features/classes/hooks";
import { PAGE_SIZE } from "@/lib/constants";
import type { Class } from "@/types/domain";

export default function ClassesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const classes = useClasses({ page, size: PAGE_SIZE, search });
  const deleteClass = useDeleteClass();

  const columns = useMemo(() => getClassColumns({ onDelete: setClassToDelete }), []);

  function handleConfirmDelete() {
    if (!classToDelete) return;
    deleteClass.mutate(classToDelete.uuid, {
      onSuccess: () => setClassToDelete(null),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Turmas"
        description="Gerencie as ofertas de disciplinas por período."
        action={
          <Button asChild>
            <Link href="/admin/classes/new">
              <Plus className="size-4" aria-hidden />
              Nova turma
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={classes.data?.content}
        isLoading={classes.isLoading}
        isError={classes.isError}
        onRetry={() => classes.refetch()}
        page={page}
        totalPages={classes.data?.totalPages ?? 0}
        totalElements={classes.data?.totalElements ?? 0}
        onPageChange={setPage}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        searchPlaceholder="Buscar por turma, disciplina ou professor"
        emptyTitle="Nenhuma turma encontrada"
        emptyDescription={
          search
            ? "Ajuste a busca e tente novamente."
            : "Crie a primeira turma para começar."
        }
        emptyAction={
          !search && (
            <Button asChild size="sm">
              <Link href="/admin/classes/new">Nova turma</Link>
            </Button>
          )
        }
      />

      <ConfirmDialog
        open={Boolean(classToDelete)}
        onOpenChange={(open) => !open && setClassToDelete(null)}
        title="Remover turma"
        description={`Tem certeza que deseja remover a turma ${classToDelete?.code}? As matrículas da turma também serão removidas.`}
        isPending={deleteClass.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
