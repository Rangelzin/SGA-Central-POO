"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { AssessmentsDialog } from "@/features/grades/assessments-dialog";
import { useSetAttendance, useSetGrade } from "@/features/grades/hooks";
import { computeEnrollmentStatus } from "@/lib/academic";
import { cn } from "@/lib/utils";
import { MIN_ATTENDANCE, PASSING_GRADE, type Enrollment } from "@/types/domain";

function parseDraft(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
}

/** Linha editável de notas/frequência com status recalculado em tempo real (RF-05). */
export function GradeRow({
  enrollment,
  classId,
}: {
  enrollment: Enrollment;
  classId: string;
}) {
  const [gradeDraft, setGradeDraft] = useState(
    enrollment.grade !== null ? String(enrollment.grade) : "",
  );
  const [attendanceDraft, setAttendanceDraft] = useState(
    enrollment.attendance !== null ? String(enrollment.attendance) : "",
  );
  const [assessmentsOpen, setAssessmentsOpen] = useState(false);

  // Ressincroniza quando o servidor recalcula (ex.: avaliações alteradas)
  useEffect(() => {
    setGradeDraft(enrollment.grade !== null ? String(enrollment.grade) : "");
    setAttendanceDraft(
      enrollment.attendance !== null ? String(enrollment.attendance) : "",
    );
  }, [enrollment.grade, enrollment.attendance]);

  const setGrade = useSetGrade(classId);
  const setAttendance = useSetAttendance(classId);

  const draftGrade = parseDraft(gradeDraft);
  const draftAttendance = parseDraft(attendanceDraft);
  const predictedStatus = computeEnrollmentStatus(draftGrade, draftAttendance);

  const gradeDirty = draftGrade !== enrollment.grade;
  const attendanceDirty = draftAttendance !== enrollment.attendance;
  const isDirty = gradeDirty || attendanceDirty;
  const isPending = setGrade.isPending || setAttendance.isPending;

  function handleSave() {
    if (gradeDirty && draftGrade !== null) {
      setGrade.mutate({ enrollmentId: enrollment.uuid, grade: draftGrade });
    }
    if (attendanceDirty && draftAttendance !== null) {
      setAttendance.mutate({
        enrollmentId: enrollment.uuid,
        attendance: draftAttendance,
      });
    }
  }

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{enrollment.student.name}</p>
        <p className="text-xs text-muted-foreground">
          {enrollment.student.enrollmentCode}
        </p>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={gradeDraft}
          onChange={(event) => setGradeDraft(event.target.value)}
          aria-label={`Nota de ${enrollment.student.name}`}
          className={cn(
            "w-24 tabular-nums",
            draftGrade !== null && draftGrade < PASSING_GRADE && "text-destructive",
          )}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          max={100}
          step={1}
          value={attendanceDraft}
          onChange={(event) => setAttendanceDraft(event.target.value)}
          aria-label={`Frequência de ${enrollment.student.name}`}
          className={cn(
            "w-24 tabular-nums",
            draftAttendance !== null &&
              draftAttendance < MIN_ATTENDANCE &&
              "border-warning text-warning",
          )}
        />
      </TableCell>
      <TableCell>
        <StatusBadge status={predictedStatus} />
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAssessmentsOpen(true)}
        >
          <ClipboardList className="size-4" aria-hidden />
          Avaliações ({enrollment.assessments.length})
        </Button>
        <AssessmentsDialog
          enrollment={enrollment}
          classId={classId}
          open={assessmentsOpen}
          onOpenChange={setAssessmentsOpen}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button size="sm" onClick={handleSave} disabled={!isDirty || isPending}>
          <Save className="size-4" aria-hidden />
          Salvar
        </Button>
      </TableCell>
    </TableRow>
  );
}
