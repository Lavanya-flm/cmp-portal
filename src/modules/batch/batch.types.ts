import { Batch, Trainer, BatchLinks } from '@prisma/client';

export type BatchEntity = Batch;
export type TrainerEntity = Trainer;
export type BatchLinksEntity = BatchLinks;

export type BatchWithRelations = Batch & {
  trainer: Trainer | null;
  batchLinks: BatchLinks | null;
};

// ─── Trainer DTOs ─────────────────────────────────────────────────────────────

export interface CreateTrainerDto {
  name: string;
  email: string;
  phone?: string;
  experience?: number;
  currentCompany?: string;
}

export interface UpdateTrainerDto {
  name?: string;
  email?: string;
  phone?: string;
  experience?: number;
  currentCompany?: string;
}

// ─── BatchLinks DTOs ──────────────────────────────────────────────────────────

export interface CreateBatchLinksDto {
  syllabusLink?: string;
  projectsLink?: string;
  trainerDemoRecording?: string;
  liveDemoRecording1?: string;
  liveDemoRecording2?: string;
  paymentLink?: string;
  whatsappGroupLink?: string;
  communityLink?: string;
}

export interface UpdateBatchLinksDto extends CreateBatchLinksDto {}

// ─── Batch DTOs ───────────────────────────────────────────────────────────────
// status is intentionally excluded — computed dynamically from dates

export interface CreateBatchDto {
  batchMonthYear?: string;
  batchName: string;
  startDate: string;
  endDate?: string;
  price: number;
  supportEmail: string;
  duration?: string;
  extraOffers?: string | null;
  feedback1?: number | null;
  feedback2?: number | null;
  feedback3?: number | null;
  overallFeedback?: number | null;
  trainer: CreateTrainerDto;
  batchLinks?: CreateBatchLinksDto;
}

/** Internal DTO used by the repository — batchNumber is computed by the service */
export interface CreateBatchWithNumberDto extends CreateBatchDto {
  batchNumber: number;
}

export interface UpdateBatchDto {
  batchName?: string;
  batchMonthYear?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  supportEmail?: string;
  duration?: string;
  extraOffers?: string | null;
  feedback1?: number | null;
  feedback2?: number | null;
  feedback3?: number | null;
  overallFeedback?: number | null;
  trainer?: UpdateTrainerDto;
  batchLinks?: UpdateBatchLinksDto;
}

export interface BatchQueryDto {
  page?: number;
  limit?: number;
  /** Defaults to 'createdAt' — newest first */
  sortBy?: 'batchNumber' | 'startDate' | 'createdAt';
  /** Defaults to 'desc' */
  sortOrder?: 'asc' | 'desc';
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface TrainerResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  experience: number | null;
  currentCompany: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchLinksResponse {
  id: string;
  syllabusLink: string | null;
  projectsLink: string | null;
  trainerDemoRecording: string | null;
  liveDemoRecording1: string | null;
  liveDemoRecording2: string | null;
  paymentLink: string | null;
  whatsappGroupLink: string | null;
  communityLink: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchResponse {
  id: string;
  courseId: string;
  batchNumber: number;
  batchMonthYear: string | null;
  batchName: string;
  /** Derived at runtime — not stored in DB */
  status: string;
  startDate: Date;
  endDate: Date | null;
  price: number;
  supportEmail: string;
  duration: string | null;
  extraOffers: string | null;
  feedback1: number | null;
  feedback2: number | null;
  feedback3: number | null;
  overallFeedback: number | null;
  trainer: TrainerResponse | null;
  batchLinks: BatchLinksResponse | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FindAllBatchesResult {
  data: BatchWithRelations[];
  total: number;
}
