"use client";

import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  // Paginação server-side (envelope Page<T> da seção 8.1)
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  // Busca server-side
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  isError = false,
  onRetry,
  page,
  totalPages,
  totalElements,
  onPageChange,
  search,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  emptyTitle,
  emptyDescription,
  emptyAction,
}: DataTableProps<TData>) {
  const [searchDraft, setSearchDraft] = useState(search ?? "");

  // Debounce da busca para não disparar uma query por tecla
  useEffect(() => {
    if (!onSearchChange) return;
    const timer = setTimeout(() => {
      if (searchDraft !== (search ?? "")) onSearchChange(searchDraft);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const showEmpty = !isLoading && !isError && (data?.length ?? 0) === 0;

  return (
    <div className="space-y-3">
      {onSearchChange && (
        <div className="relative max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-8"
          />
        </div>
      )}

      {isError ? (
        <ErrorState onRetry={onRetry} />
      ) : showEmpty ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-4 w-full max-w-32" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!showEmpty && !isError && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {totalElements} registro{totalElements === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Página anterior"
              disabled={page <= 0 || isLoading}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <span>
              Página {page + 1} de {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Próxima página"
              disabled={page >= totalPages - 1 || isLoading}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
