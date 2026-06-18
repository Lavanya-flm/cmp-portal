import { useState } from 'react';
import {
  Mail, Phone, Briefcase, Building2,
  FileText, Code, Video, Play, CreditCard, MessageCircle, ExternalLink,
} from 'lucide-react';
import type { Batch, BatchLinks } from '../../../types';
import { ResourcesTab } from './ResourcesTab';

type Tab = 'trainer' | 'links' | 'resources';

// ─── Trainer tab ──────────────────────────────────────────────────────────────

function TrainerTab({ batch }: { batch: Batch }) {
  const t = batch.trainer;
  if (!t) return <p className="py-6 text-center text-sm italic text-gray-400">No trainer assigned to this batch.</p>;

  const initials = t.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-2xl font-bold text-amber-600">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{t.name}</p>
          {t.currentCompany && <p className="text-sm text-gray-500">{t.currentCompany}</p>}
          {t.experience != null && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              <Briefcase size={11} />{t.experience}+ Years Experience
            </span>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40">
        {[
          { icon: <Mail size={13} />,      label: 'Email',           value: t.email },
          { icon: <Phone size={13} />,     label: 'Phone',           value: t.phone },
          { icon: <Briefcase size={13} />, label: 'Experience',      value: t.experience != null ? `${t.experience}+ Years` : null },
          { icon: <Building2 size={13} />, label: 'Current Company', value: t.currentCompany },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
            <span className="shrink-0 text-gray-400">{icon}</span>
            <span className="w-32 shrink-0 text-xs font-semibold text-gray-400">{label}</span>
            <span className="truncate text-sm text-gray-700">{value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Links tab ────────────────────────────────────────────────────────────────

interface LinkDef { key: keyof BatchLinks; icon: React.ReactNode; label: string; }

const LINK_DEFS: LinkDef[] = [
  { key: 'syllabusLink',         icon: <FileText size={14} />,      label: 'Syllabus' },
  { key: 'projectsLink',         icon: <Code size={14} />,          label: 'Projects' },
  { key: 'trainerDemoRecording', icon: <Video size={14} />,         label: 'Trainer Demo Recording' },
  { key: 'liveDemoRecording1',   icon: <Play size={14} />,          label: 'Live Demo Recording 1' },
  { key: 'liveDemoRecording2',   icon: <Play size={14} />,          label: 'Live Demo Recording 2' },
  { key: 'paymentLink',          icon: <CreditCard size={14} />,    label: 'Payment Link' },
  { key: 'whatsappGroupLink',    icon: <MessageCircle size={14} />, label: 'WhatsApp Group' },
  { key: 'communityLink',        icon: <MessageCircle size={14} />, label: 'Community Link' },
];

function LinksTab({ links }: { links: BatchLinks | null }) {
  if (!links) return <p className="py-6 text-center text-sm italic text-gray-400">No resource links available.</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      {LINK_DEFS.map(({ key, icon, label }) => {
        const url = links[key] as string | null;
        const isSet = typeof url === 'string' && url.startsWith('http');
        return (
          <div key={key} className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-b-0 hover:bg-gray-50 transition-colors">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${isSet ? 'border-gray-200 bg-white text-gray-500' : 'border-gray-100 bg-gray-50 text-gray-300'}`}>
              {icon}
            </div>
            <span className={`flex-1 text-sm font-medium ${isSet ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
            {isSet ? (
              <a href={url!} target="_blank" rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm hover:border-amber-300 hover:text-amber-600 transition-colors"
                aria-label={`Open ${label}`}>
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
  const [tab, setTab] = useState<Tab>('trainer');

  const TABS: { id: Tab; label: string }[] = [
    { id: 'trainer',   label: 'Trainer'    },
    { id: 'links',     label: 'Links'      },
    { id: 'resources', label: 'Resources'  },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              'mr-6 border-b-2 pb-2.5 pt-3 text-sm font-medium transition-colors',
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
        {tab === 'trainer'   && <TrainerTab batch={batch} />}
        {tab === 'links'     && <LinksTab   links={batch.batchLinks} />}
        {tab === 'resources' && <ResourcesTab batchId={batch.id} />}
      </div>
    </div>
  );
}
