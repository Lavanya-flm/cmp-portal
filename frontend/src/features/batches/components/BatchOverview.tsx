import { useState } from 'react';
import {
  Calendar, Mail, Phone, Briefcase, Building2,
  FileText, Code, Video, Play, CreditCard, MessageCircle,
  ExternalLink, IndianRupee, Hash,
} from 'lucide-react';
import type { Batch, BatchLinks } from '../../../types';
import { formatDate } from '../../../utils/format';
import { BatchStatusBadge } from './BatchStatusBadge';

type Tab = 'overview' | 'trainer' | 'links';

// ─── Overview tab — lighter font-weight ───────────────────────────────────────

function OverviewTab({ batch }: { batch: Batch }) {
  const cells = [
    { icon: <Hash size={11} />,          label: 'Batch',        value: `#${batch.batchNumber}` },
    { icon: <Calendar size={11} />,      label: 'Start Date',   value: formatDate(batch.startDate) },
    { icon: <Calendar size={11} />,      label: 'End Date',     value: formatDate(batch.endDate) },
    { icon: <IndianRupee size={11} />,   label: 'Price',        value: `₹${batch.price.toLocaleString('en-IN')}` },
    { icon: <Mail size={11} />,          label: 'Support',      value: batch.supportEmail },
    { icon: <Briefcase size={11} />,     label: 'Trainer',      value: batch.trainer?.name || '—' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cells.map(({ icon, label, value }) => (
        <div key={label} className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            <span className="text-gray-300">{icon}</span>
            {label}
          </div>
          {/* font-medium instead of font-bold — lighter feel */}
          <p className="truncate text-sm font-medium text-gray-700">{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Trainer tab — clean profile, no About/Skills ─────────────────────────────

function TrainerTab({ batch }: { batch: Batch }) {
  const t = batch.trainer;

  if (!t) {
    return <p className="py-6 text-center text-sm italic text-gray-400">No trainer assigned to this batch.</p>;
  }

  const initials = t.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-600 border border-amber-200">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{t.name}</p>
          {t.currentCompany && <p className="text-sm text-gray-500">{t.currentCompany}</p>}
          {t.experience != null && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              <Briefcase size={11} />
              {t.experience}+ Years Experience
            </span>
          )}
        </div>
      </div>

      {/* Info list — simple rows, no generated prose */}
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/40 overflow-hidden">
        {[
          { icon: <Mail size={13} />,      label: 'Email',           value: t.email },
          { icon: <Phone size={13} />,     label: 'Phone',           value: t.phone },
          { icon: <Briefcase size={13} />, label: 'Experience',      value: t.experience != null ? `${t.experience}+ Years` : null },
          { icon: <Building2 size={13} />, label: 'Current Company', value: t.currentCompany },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-2.5">
            <span className="shrink-0 text-gray-400">{icon}</span>
            <span className="w-28 shrink-0 text-xs font-semibold text-gray-400">{label}</span>
            <span className="truncate text-sm text-gray-700">{value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Links tab — clean resource list with divide-y ────────────────────────────

interface LinkDef {
  key: keyof BatchLinks;
  icon: React.ReactNode;
  label: string;
}

const LINK_DEFS: LinkDef[] = [
  { key: 'syllabusLink',         icon: <FileText size={14} />,      label: 'Syllabus' },
  { key: 'projectsLink',         icon: <Code size={14} />,          label: 'Projects' },
  { key: 'trainerDemoRecording', icon: <Video size={14} />,         label: 'Trainer Demo Recording' },
  { key: 'liveDemoRecording1',   icon: <Play size={14} />,          label: 'Live Demo Recording 1' },
  { key: 'liveDemoRecording2',   icon: <Play size={14} />,          label: 'Live Demo Recording 2' },
  { key: 'paymentLink',          icon: <CreditCard size={14} />,    label: 'Payment Link' },
  { key: 'whatsappGroupLink',    icon: <MessageCircle size={14} />, label: 'WhatsApp Group' },
];

function LinksTab({ links }: { links: BatchLinks | null }) {
  if (!links) {
    return <p className="py-6 text-center text-sm italic text-gray-400">No resource links available.</p>;
  }

  const hasAny = LINK_DEFS.some(({ key }) => {
    const v = links[key];
    return typeof v === 'string' && v.startsWith('http');
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      {!hasAny && (
        <p className="px-4 py-5 text-center text-sm italic text-gray-400">No links have been configured yet.</p>
      )}
      {LINK_DEFS.map(({ key, icon, label }) => {
        const url = links[key] as string | null;
        const isSet = typeof url === 'string' && url.startsWith('http');

        return (
          <div
            key={key}
            className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-b-0 hover:bg-gray-50 transition-colors"
          >
            {/* Icon in bordered container */}
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${isSet ? 'border-gray-200 bg-white text-gray-500' : 'border-gray-100 bg-gray-50 text-gray-300'}`}>
              {icon}
            </div>

            {/* Label */}
            <span className={`flex-1 text-sm font-medium ${isSet ? 'text-gray-700' : 'text-gray-400'}`}>
              {label}
            </span>

            {/* External link or not-set indicator */}
            {isSet ? (
              <a
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-amber-300 hover:text-amber-600 transition-colors shadow-sm"
                aria-label={`Open ${label}`}
              >
                Open <ExternalLink size={10} />
              </a>
            ) : (
              <span className="text-[10px] italic text-gray-300">Not set</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── BatchOverview ────────────────────────────────────────────────────────────

interface BatchOverviewProps {
  batch: Batch;
  courseId: string;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (batch: Batch) => void;
}

export function BatchOverview({ batch }: BatchOverviewProps) {
  const [tab, setTab] = useState<Tab>('overview');

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'trainer',  label: 'Trainer'  },
    { id: 'links',    label: 'Links'    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-700">{batch.batchName}</h3>
        <BatchStatusBadge batch={batch} />
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              'mr-6 pb-2.5 pt-3 text-sm font-medium border-b-2 transition-colors',
              tab === t.id
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {tab === 'overview' && <OverviewTab batch={batch} />}
        {tab === 'trainer'  && <TrainerTab  batch={batch} />}
        {tab === 'links'    && <LinksTab    links={batch.batchLinks} />}
      </div>
    </div>
  );
}
