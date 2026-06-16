import { Batch, Trainer, BatchLinks } from '@prisma/client';

// ─── Entities ─────────────────────────────────────────────────────────────────

export type BatchEntity = Batch;
export type TrainerEntity = Trainer;
export type BatchLinksEntity = BatchLinks;

/** Full batch record with both relations included */
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

export interface CreateBatchDto {
  batchNumber: number;
  batchMonthYear?: string;
  batchName: string;
  status?: string;
  startDate: string;
  endDate?: string;
  price: number;
  supportEmail: string;
  trainer: CreateTrainerDto;
  batchLinks?: CreateBatchLinksDto;
}

export interface UpdateBatchDto {
  batchName?: string;
  batchMonthYear?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  supportEmail?: string;
  trainer?: UpdateTrainerDto;
  batchLinks?: UpdateBatchLinksDto;
}

export interface BatchQueryDto {
  page?: number;
  limit?: number;
  sortBy?: 'batchNumber' | 'startDate' | 'createdAt';
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
  status: string;
  startDate: Date;
  endDate: Date | null;
  price: number;
  supportEmail: string;
  trainer: TrainerResponse | null;
  batchLinks: BatchLinksResponse | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Repository result ────────────────────────────────────────────────────────

export interface FindAllBatchesResult {
  data: BatchWithRelations[];
  total: number;
}
