import { useState } from 'react';
import {
  FolderOpen, Plus, Upload, X, Download, Trash2,
  FileText, AlertCircle, Loader2, ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  useBatchResources,
  useCreateBatchResource,
  useDeleteBatchResource,
} from '../../../hooks/useBatchResources';
import { useIsAdmin } from '../../../hooks/usePermission';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../components/ui/Toast';
import {
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  type BatchResource,
  type ResourceType,
} from '../../../types';
import { getErrorMessage } from '../../../utils/format';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

interface DeleteConfirmProps {
  resource: BatchResource;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ resource, isDeleting, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-gray-900">Delete Resource</h3>
        <p className="mt-2 text-sm text-gray-500">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-800">"{resource.title}"</span>?
          <br />
          This action cannot be undone.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting
              ? <><Loader2 size={14} className="animate-spin" /> Deleting…</>
              : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Resource Card ────────────────────────────────────────────────────────────

interface ResourceCardProps {
  resource: BatchResource;
  canDelete: boolean;
  onDownload: (resource: BatchResource) => void;
  onDeleteClick: (resource: BatchResource) => void;
}

function ResourceCard({ resource, canDelete, onDownload, onDeleteClick }: ResourceCardProps) {
  return (
    <div className="flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
        <FileText size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800">{resource.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
            {resource.resourceTypeLabel}
          </span>
          {resource.fileSize != null && (
            <span className="text-[11px] text-gray-400">{formatBytes(resource.fileSize)}</span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-gray-400">Uploaded: {formatDate(resource.createdAt)}</p>
        {resource.description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-1">{resource.description}</p>
        )}
      </div>

      {/* Actions — Download + Delete only, horizontal */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => onDownload(resource)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
          title="Download"
        >
          <Download size={14} />
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDeleteClick(resource)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Category section (collapsible) ──────────────────────────────────────────

interface CategorySectionProps {
  type: string;
  items: BatchResource[];
  canDelete: boolean;
  onDownload: (resource: BatchResource) => void;
  onDeleteClick: (resource: BatchResource) => void;
}

function CategorySection({ type, items, canDelete, onDownload, onDeleteClick }: CategorySectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-2 flex w-full items-center gap-2 text-left"
      >
        {open
          ? <ChevronDown  size={14} className="shrink-0 text-gray-400" />
          : <ChevronRight size={14} className="shrink-0 text-gray-400" />
        }
        <span className="text-xs font-semibold text-gray-600">
          {RESOURCE_TYPE_LABELS[type as ResourceType]}
        </span>
        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
          {items.length}
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {items.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              canDelete={canDelete}
              onDownload={onDownload}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Resource Modal ───────────────────────────────────────────────────────

interface AddResourceModalProps {
  batchId: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function AddResourceModal({ batchId, onClose, onSuccess, onError }: AddResourceModalProps) {
  const { mutate: create, isPending, reset } = useCreateBatchResource(batchId);

  const [resourceType, setResourceType] = useState<ResourceType>('SYLLABUS');
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [file, setFile]                 = useState<File | null>(null);
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});

  const ACCEPTED = '.pdf,.doc,.docx,.ppt,.pptx,.xlsx,.zip';

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!file)         errs.file  = 'Please select a file';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !file) return;
    reset();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const fileUrl = ev.target?.result as string;
      create(
        {
          resourceType,
          title:       title.trim(),
          description: description.trim() || undefined,
          fileName:    file.name,
          fileUrl,
          fileSize:    file.size,
          mimeType:    file.type || undefined,
        },
        {
          onSuccess: () => { onSuccess(); onClose(); },
          onError:   (err) => onError(getErrorMessage(err)),
        },
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Add Resource</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Resource Type *</label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as ResourceType)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {RESOURCE_TYPES.map((rt) => (
                <option key={rt} value={rt}>{RESOURCE_TYPE_LABELS[rt]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AWS & Azure Syllabus"
              className={`h-11 w-full rounded-lg border px-3.5 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 ${fieldErrors.title ? 'border-red-400' : 'border-gray-300'}`}
            />
            {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional description"
              className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Upload File *</label>
            <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition-all ${fieldErrors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/30'}`}>
              <Upload size={20} className="text-gray-400" />
              {file ? (
                <div className="text-center">
                  <p className="max-w-[200px] truncate text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Click to select file</p>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX, PPT, PPTX, XLSX, ZIP</p>
                </div>
              )}
              <input
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => { setFile(e.target.files?.[0] ?? null); setFieldErrors((p) => ({ ...p, file: '' })); }}
              />
            </label>
            {fieldErrors.file && <p className="text-xs text-red-500">{fieldErrors.file}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={isPending}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
              {isPending
                ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                : <><Upload size={14} /> Upload Resource</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Resources Tab ────────────────────────────────────────────────────────────

interface ResourcesTabProps {
  batchId: string;
}

export function ResourcesTab({ batchId }: ResourcesTabProps) {
  const [showModal, setShowModal]             = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<BatchResource | null>(null);

  const isAdmin = useIsAdmin();
  const { toasts, addToast, removeToast } = useToast();

  const { data: resources = [], isLoading, error } = useBatchResources(batchId);
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteBatchResource(batchId);

  // Group by resourceType
  const grouped = resources.reduce<Record<string, BatchResource[]>>((acc, r) => {
    if (!acc[r.resourceType]) acc[r.resourceType] = [];
    acc[r.resourceType].push(r);
    return acc;
  }, {});

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDownload = (resource: BatchResource) => {
    try {
      const a = document.createElement('a');
      a.href     = resource.fileUrl;
      a.download = resource.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addToast('Download started', 'success');
    } catch {
      addToast('Failed to download resource', 'error');
    }
  };

  const handleDeleteConfirm = () => {
    if (!resourceToDelete) return;
    deleteResource(resourceToDelete.id, {
      onSuccess: () => {
        addToast('Resource deleted successfully', 'success');
        setResourceToDelete(null);
      },
      onError: (err) => {
        addToast(getErrorMessage(err) || 'Failed to delete resource', 'error');
        setResourceToDelete(null);
      },
    });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-700">Resources</p>
          {resources.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              {resources.length}
            </span>
          )}
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            <Plus size={13} /> Add Resource
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 w-full rounded-xl bg-gray-100" />)}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle size={14} /> {getErrorMessage(error)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && resources.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
            <FolderOpen size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">No Resources Available</p>
            <p className="mt-1 max-w-xs text-xs text-gray-400">
              Upload study materials, assignments, PPTs, notes and placement resources for this batch.
            </p>
          </div>
          {isAdmin && (
            <button type="button" onClick={() => setShowModal(true)}
              className="mt-1 flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
              <Plus size={13} /> Add Resource
            </button>
          )}
        </div>
      )}

      {/* Grouped collapsible sections */}
      {!isLoading && !error && resources.length > 0 && (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([type, items]) => (
            <CategorySection
              key={type}
              type={type}
              items={items}
              canDelete={isAdmin}
              onDownload={handleDownload}
              onDeleteClick={setResourceToDelete}
            />
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {showModal && (
        <AddResourceModal
          batchId={batchId}
          onClose={() => setShowModal(false)}
          onSuccess={() => addToast('Resource uploaded successfully', 'success')}
          onError={(msg) => addToast(msg || 'Failed to upload resource. Please try again.', 'error')}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {resourceToDelete && (
        <DeleteConfirmDialog
          resource={resourceToDelete}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setResourceToDelete(null)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
