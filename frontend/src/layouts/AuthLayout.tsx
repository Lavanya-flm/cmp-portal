import { ReactNode } from 'react';

/* ─── Inline SVG illustration ─────────────────────────────────────────────────
   A lightweight laptop / dashboard scene consistent with the reference image.  */
function DashboardIllustration() {
  return (
    <svg
      viewBox="0 0 480 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md"
      aria-hidden="true"
    >
      {/* Laptop base */}
      <rect x="60" y="40" width="360" height="230" rx="12" fill="#1F2937" />
      <rect x="72" y="52" width="336" height="206" rx="6" fill="#F9FAFB" />
      {/* Screen content — sidebar */}
      <rect x="72" y="52" width="60" height="206" rx="6" fill="#F3F4F6" />
      <rect x="84" y="72" width="36" height="36" rx="8" fill="#F59E0B" opacity="0.9" />
      <rect x="90" y="124" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="90" y="136" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="90" y="148" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="90" y="160" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="90" y="172" width="24" height="4" rx="2" fill="#D1D5DB" />
      {/* Main area — header */}
      <rect x="142" y="64" width="110" height="8" rx="4" fill="#E5E7EB" />
      {/* Stat cards */}
      <rect x="142" y="84" width="72" height="48" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="150" y="92" width="20" height="20" rx="5" fill="#FEF3C7" />
      <rect x="150" y="116" width="40" height="6" rx="3" fill="#E5E7EB" />
      <rect x="222" y="84" width="72" height="48" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="230" y="92" width="20" height="20" rx="5" fill="#DCFCE7" />
      <rect x="230" y="116" width="40" height="6" rx="3" fill="#E5E7EB" />
      <rect x="302" y="84" width="72" height="48" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="310" y="92" width="20" height="20" rx="5" fill="#FEE2E2" />
      <rect x="310" y="116" width="40" height="6" rx="3" fill="#E5E7EB" />
      {/* Chart area */}
      <rect x="142" y="142" width="232" height="100" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="152" y="152" width="80" height="6" rx="3" fill="#E5E7EB" />
      {/* Chart bars */}
      <rect x="160" y="218" width="16" height="16" rx="3" fill="#F59E0B" opacity="0.4" />
      <rect x="184" y="206" width="16" height="28" rx="3" fill="#F59E0B" opacity="0.6" />
      <rect x="208" y="196" width="16" height="38" rx="3" fill="#F59E0B" opacity="0.8" />
      <rect x="232" y="184" width="16" height="50" rx="3" fill="#F59E0B" />
      <rect x="256" y="200" width="16" height="34" rx="3" fill="#F59E0B" opacity="0.7" />
      <rect x="280" y="210" width="16" height="24" rx="3" fill="#F59E0B" opacity="0.5" />
      <rect x="304" y="188" width="16" height="46" rx="3" fill="#F59E0B" opacity="0.9" />
      {/* Laptop keyboard */}
      <rect x="30" y="276" width="420" height="18" rx="4" fill="#374151" />
      <rect x="170" y="270" width="140" height="10" rx="3" fill="#4B5563" />
      {/* Decorative dots */}
      <circle cx="410" cy="80" r="4" fill="#F59E0B" opacity="0.5" />
      <circle cx="426" cy="80" r="4" fill="#F59E0B" opacity="0.3" />
      <circle cx="442" cy="80" r="4" fill="#F59E0B" opacity="0.2" />
      {/* Plant */}
      <rect x="38" y="255" width="28" height="18" rx="4" fill="#9CA3AF" />
      <ellipse cx="52" cy="248" rx="10" ry="14" fill="#6EE7B7" opacity="0.8" />
      <ellipse cx="44" cy="242" rx="8" ry="10" fill="#34D399" opacity="0.7" />
      <ellipse cx="60" cy="244" rx="8" ry="10" fill="#34D399" opacity="0.7" />
      {/* Books stack */}
      <rect x="380" y="260" width="60" height="10" rx="3" fill="#F59E0B" />
      <rect x="374" y="250" width="66" height="12" rx="3" fill="#1F2937" />
      <rect x="380" y="240" width="58" height="12" rx="3" fill="#3B82F6" opacity="0.8" />
    </svg>
  );
}

/* ─── Decorative dot pattern ──────────────────────────────────────────────── */
function DotPattern() {
  const dots = Array.from({ length: 24 });
  return (
    <div className="absolute top-16 right-12 grid grid-cols-6 gap-3 opacity-30">
      {dots.map((_, i) => (
        <div key={i} className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      ))}
    </div>
  );
}

/* ─── CMP logo mark ───────────────────────────────────────────────────────── */
function CmpLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-md shadow-amber-200">
        <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6" aria-hidden="true">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-bold leading-none text-gray-900">CMP Portal</p>
        <p className="text-xs text-gray-500">Course Management Portal</p>
      </div>
    </div>
  );
}

/* ─── AuthLayout ──────────────────────────────────────────────────────────── */
interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFF9F1] flex flex-col lg:flex-row">

      {/* ── Left panel — branding ────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden px-12 py-10">
        <DotPattern />

        {/* Logo */}
        <CmpLogo />

        {/* Hero copy */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-gray-900">
              Manage Courses.
              <br />
              Empower Learning.
              <br />
              Drive{' '}
              <span className="text-amber-500">Success.</span>
            </h1>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-gray-500">
              A complete platform to manage courses, batches, trainers and learners with ease.
            </p>
          </div>

          {/* Illustration */}
          <DashboardIllustration />
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} CMP Portal. All rights reserved.
        </p>

        {/* Decorative circle */}
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-100 opacity-60" />
        <div className="absolute bottom-32 right-0 h-24 w-24 rounded-full bg-amber-200 opacity-40" />
      </div>

      {/* ── Right panel — form area ──────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile logo */}
        <div className="flex items-center justify-between px-6 pt-6 lg:hidden">
          <CmpLogo />
        </div>

        {/* Help link */}
        <div className="hidden lg:flex justify-end px-10 pt-6">
          <a
            href="mailto:support@cmp.io"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-500 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
              <path d="M12 16v-4m0-4h.01" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Need help?
          </a>
        </div>

        {/* Form centred */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-16">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Mobile footer */}
        <p className="pb-6 text-center text-xs text-gray-400 lg:hidden">
          © {new Date().getFullYear()} CMP Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}
