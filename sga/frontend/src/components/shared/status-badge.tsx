import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EnrollmentStatus } from "@/types/domain";

/** Convenção visual de domínio (seção 6.5 do plano). */
const statusConfig: Record<EnrollmentStatus, { label: string; className: string }> = {
  APPROVED: {
    label: "Aprovado",
    className: "border-transparent bg-success/15 text-success",
  },
  FAILED: {
    label: "Reprovado",
    className: "border-transparent bg-destructive/15 text-destructive",
  },
  ENROLLED: {
    label: "Matriculado",
    className: "border-transparent bg-primary/15 text-primary",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    className: "border-transparent bg-primary/15 text-primary",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "border-transparent bg-muted text-muted-foreground",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: EnrollmentStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
