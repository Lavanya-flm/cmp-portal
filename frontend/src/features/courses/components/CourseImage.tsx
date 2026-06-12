import { BookOpen } from 'lucide-react';

interface CourseImageProps {
  courseName: string;
  className?: string;
}

// Deterministic gradient from course name
function getCourseGradient(name: string): string {
  const gradients = [
    'from-violet-600 via-purple-600 to-indigo-700',
    'from-blue-600 via-blue-700 to-cyan-700',
    'from-emerald-500 via-teal-600 to-green-700',
    'from-orange-500 via-amber-500 to-yellow-500',
    'from-rose-500 via-red-600 to-pink-700',
    'from-slate-600 via-gray-700 to-zinc-800',
    'from-fuchsia-600 via-pink-600 to-rose-600',
    'from-sky-500 via-blue-600 to-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getCourseInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function CourseImage({ courseName, className = '' }: CourseImageProps) {
  const gradient = getCourseGradient(courseName);
  const initials = getCourseInitials(courseName);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
      aria-hidden="true"
    >
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10" />

      {/* Centered icon + initials */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <BookOpen size={22} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-wide text-white/90">{initials}</span>
      </div>

      {/* Live badge */}
      <div className="absolute left-3 top-3">
        <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Live
        </span>
      </div>
    </div>
  );
}
