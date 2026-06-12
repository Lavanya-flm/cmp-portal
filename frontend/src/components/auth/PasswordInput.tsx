import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? 'password';

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Lock icon */}
          <span className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
            <Lock size={16} />
          </span>

          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className={[
              'w-full h-11 rounded-lg border bg-white text-sm text-gray-900 placeholder-gray-400',
              'pl-10 pr-11 transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                : 'border-gray-300 hover:border-gray-400',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {/* Toggle visibility */}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
export { PasswordInput };
