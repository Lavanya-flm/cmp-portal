import { ReactNode } from 'react';

function DashboardIllustration() {
  return (
    <svg
      viewBox="0 0 480 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[500px]"
      aria-hidden="true"
    >
      <rect x="60" y="40" width="360" height="230" rx="12" fill="#1F2937" />
      <rect x="72" y="52" width="336" height="206" rx="6" fill="#F9FAFB" />
      <rect x="72" y="52" width="60" height="206" rx="6" fill="#F3F4F6" />
      <rect x="84" y="72" width="36" height="36" rx="8" fill="#F59E0B" opacity="0.9" />
      <rect x="90" y="124" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="90" y="136" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="90" y="148" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="90" y="160" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="90" y="172" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="142" y="64" width="110" height="8" rx="4" fill="#E5E7EB" />
      <rect x="142" y="84" width="72" height="48" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="150" y="92" width="20" height="20" rx="5" fill="#FEF3C7" />
      <rect x="150" y="116" width="40" height="6" rx="3" fill="#E5E7EB" />
      <rect x="222" y="84" width="72" height="48" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="230" y="92" width="20" height="20" rx="5" fill="#DCFCE7" />
      <rect x="230" y="116" width="40" height="6" rx="3" fill="#E5E7EB" />
      <rect x="302" y="84" width="72" height="48" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="310" y="92" width="20" height="20" rx="5" fill="#FEE2E2" />
      <rect x="310" y="116" width="40" height="6" rx="3" fill="#E5E7EB" />
      <rect x="142" y="142" width="232" height="100" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="152" y="152" width="80" height="6" rx="3" fill="#E5E7EB" />
      <rect x="160" y="218" width="16" height="16" rx="3" fill="#F59E0B" opacity="0.4" />
      <rect x="184" y="206" width="16" height="28" rx="3" fill="#F59E0B" opacity="0.6" />
      <rect x="208" y="196" width="16" height="38" rx="3" fill="#F59E0B" opacity="0.8" />
      <rect x="232" y="184" width="16" height="50" rx="3" fill="#F59E0B" />
      <rect x="256" y="200" width="16" height="34" rx="3" fill="#F59E0B" opacity="0.7" />
      <rect x="280" y="210" width="16" height="24" rx="3" fill="#F59E0B" opacity="0.5" />
      <rect x="304" y="188" width="16" height="46" rx="3" fill="#F59E0B" opacity="0.9" />
      <rect x="30" y="276" width="420" height="18" rx="4" fill="#374151" />
      <rect x="170" y="270" width="140" height="10" rx="3" fill="#4B5563" />
      <circle cx="410" cy="80" r="4" fill="#F59E0B" opacity="0.4" />
      <circle cx="426" cy="80" r="4" fill="#F59E0B" opacity="0.25" />
      <circle cx="442" cy="80" r="4" fill="#F59E0B" opacity="0.15" />
      <rect x="38" y="255" width="28" height="18" rx="4" fill="#9CA3AF" />
      <ellipse cx="52" cy="248" rx="10" ry="14" fill="#6EE7B7" opacity="0.8" />
      <ellipse cx="44" cy="242" rx="8" ry="10" fill="#34D399" opacity="0.7" />
      <ellipse cx="60" cy="244" rx="8" ry="10" fill="#34D399" opacity="0.7" />
      <rect x="380" y="260" width="60" height="10" rx="3" fill="#F59E0B" />
      <rect x="374" y="250" width="66" height="12" rx="3" fill="#1F2937" />
      <rect x="380" y="240" width="58" height="12" rx="3" fill="#3B82F6" opacity="0.8" />
    </svg>
  );
}

function CmpLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 shadow-sm shadow-amber-200">
        <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5" aria-hidden="true">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold leading-none text-gray-900">CMP Portal</p>
        <p className="mt-0.5 text-xs text-gray-400">Course Management Portal</p>
      </div>
    </div>
  );
}

interface AuthLayoutProps {
  children: ReactNode;
  /** Register page: wider card */
  wide?: boolean;
}

export function AuthLayout({ children, wide = false }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFF9F1] flex flex-col lg:flex-row">

      {/* ── LEFT PANEL ────────────────────────────────────────────────────────
       *  Logo: absolutely positioned — doesn't shift the hero block.
       *  Hero block: flex-col justify-center — vertically centred in panel
       *  so heading aligns with the "Sign in" heading on the right.
       *  whitespace-nowrap on line 1 guarantees 2-line heading always.
       * ────────────────────────────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[44%] flex-col overflow-hidden">

        {/* Dot accent */}
        <div className="pointer-events-none absolute top-10 right-10 grid grid-cols-6 gap-3 opacity-[0.12]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          ))}
        </div>

        {/* Logo pinned top-left */}
        <div className="absolute top-10 left-16 z-10">
          <CmpLogo />
        </div>

        {/* Hero block — vertically centred */}
        <div className="flex flex-1 flex-col justify-center pl-16 pr-6 py-10">

          {/* Heading — line 1 is whitespace-nowrap so it never wraps to 3 lines */}
          <h1 className="text-[2.1rem] font-semibold leading-[1.2] tracking-[-0.025em] text-gray-900">
            <span className="whitespace-nowrap">Manage Courses. Empower Learning.</span>
            <br />
            <span className="text-amber-500">Drive Success.</span>
          </h1>

          {/* Description — wide enough to stay 2 lines naturally */}
          <p className="mt-3 max-w-[460px] text-[15px] leading-[1.65] text-gray-500">
            Everything you need to manage courses, batches,
            trainers and learners — in one place.
          </p>

          {/* Illustration — closer to description */}
          <div className="mt-4">
            <DashboardIllustration />
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-amber-100 opacity-35" />
        <div className="pointer-events-none absolute bottom-20 right-0 h-28 w-28 rounded-full bg-amber-200 opacity-20" />
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        <div className="px-6 pt-6 lg:hidden">
          <CmpLogo />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 lg:px-10">
          {/* Default 450px for all pages; 480px for register */}
          <div className={`w-full ${wide ? 'max-w-[480px]' : 'max-w-[450px]'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
