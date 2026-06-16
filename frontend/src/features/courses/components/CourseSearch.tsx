import { Search, X } from 'lucide-react';

interface CourseSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CourseSearch({
  value,
  onChange,
  placeholder = 'Search courses by name…',
}: CourseSearchProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
