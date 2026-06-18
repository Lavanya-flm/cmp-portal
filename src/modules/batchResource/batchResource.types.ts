import { BatchResource, ResourceType } from '@prisma/client';

export type BatchResourceEntity = BatchResource;

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  SYLLABUS:           'Syllabus',
  PROJECT_DOCUMENT:   'Project Documents',
  ASSIGNMENT:         'Assignments',
  INTERVIEW_QUESTION: 'Interview Questions',
  PPT:                'PPTs',
  NOTE:               'Notes',
  CHEAT_SHEET:        'Cheat Sheets',
  PLACEMENT_MATERIAL: 'Placement Materials',
};

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateBatchResourceDto {
  resourceType: ResourceType;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface BatchResourceResponse {
  id: string;
  batchId: string;
  resourceType: ResourceType;
  resourceTypeLabel: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: Date;
  updatedAt: Date;
}
