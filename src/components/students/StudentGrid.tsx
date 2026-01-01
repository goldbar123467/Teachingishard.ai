'use client';

import type { Student } from '@/lib/game/types';
import { StudentCard } from './StudentCard';

interface StudentGridProps {
  students: Student[];
  onStudentClick?: (student: Student) => void;
  compact?: boolean;
}

export function StudentGrid({ students, onStudentClick, compact = false }: StudentGridProps) {
  return (
    <div
      className={
        compact
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
          : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
      }
    >
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          onClick={() => onStudentClick?.(student)}
          compact={compact}
        />
      ))}
    </div>
  );
}
