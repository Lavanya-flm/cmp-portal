import type { Course } from '../../../types';
import { CourseCard } from './CourseCard';

interface CourseGridProps {
  courses: Course[];
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (course: Course) => void;
}

export function CourseGrid({ courses, canEdit, canDelete, onDelete }: CourseGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          canEdit={canEdit}
          canDelete={canDelete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
