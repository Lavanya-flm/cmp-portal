import { useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Trash2, Eye, LayoutGrid } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Course } from '../../../types';
import { buildRoute } from '../../../utils/constants';
import { CourseImage } from './CourseImage';
import { Button } from '../../../components/ui/Button';

interface CourseCardProps {
  course: Course;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (course: Course) => void;
}

export function CourseCard({ course, canEdit, canDelete, onDelete }: CourseCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const goToDetail = () => navigate(buildRoute.courseDetail(course.id));

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Banner */}
      <div
        className="relative h-44 cursor-pointer"
        onClick={goToDetail}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && goToDetail()}
        aria-label={`Open ${course.name}`}
      >
        <CourseImage
          courseName={course.name}
          imageUrl={course.bannerImage}
          className="h-full w-full"
        />

        {/* Kebab menu */}
        {(canEdit || canDelete) && (
          <div ref={menuRef} className="absolute right-2 top-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus:outline-none"
              aria-label="Course options"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/10">
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); goToDetail(); }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <Eye size={14} className="text-gray-400" /> View
                </button>
                {canEdit && (
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); navigate(buildRoute.courseEdit(course.id)); }}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <Pencil size={14} className="text-gray-400" /> Edit
                  </button>
                )}
                {canDelete && (
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(course); }}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 size={14} className="text-red-400" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3
          className="cursor-pointer text-sm font-bold text-gray-900 line-clamp-2 leading-snug hover:text-amber-600 transition-colors"
          onClick={goToDetail}
        >
          {course.name}
        </h3>

        {course.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
            {course.description}
          </p>
        )}

        <div className="mt-auto border-t border-gray-100 pt-3">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={goToDetail}
            className="text-amber-600 border-amber-300 hover:bg-amber-50 font-semibold"
          >
            <LayoutGrid size={13} />
            Open Course
          </Button>
        </div>
      </div>
    </article>
  );
}
