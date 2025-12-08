export enum ChallengeStatus {
  ACTIVE = "ACTIVE",
  ELIMINATED = "ELIMINATED",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED"
}

export type ValidationType = "PHOTO" | "PDF";
export type FrequencyType = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "CUSTOM";

export interface Challenge {
  id: number;
  title: string;
  description: string;
  objective: string;
  startDate: string; // LocalDate from backend comes as string (YYYY-MM-DD)
  endDate: string; // LocalDate from backend comes as string (YYYY-MM-DD)
  imageUrl: string;
  status: ChallengeStatus;
  categoryId: number;
  categoryName: string;
  creatorId: number;
  creatorUsername: string;
  progress?: number; // Optional field for user progress
  // Challenge settings properties
  validationType?: ValidationType; // PHOTO | PDF
  requireReview?: boolean; // Si requiere revisión manual
  frequency?: FrequencyType; // DAILY, WEEKLY, etc.
  pointsPerSubmission?: number; // Puntos por cada submission aprobado
}

export interface UserChallenge {
  id: number;
  userId: number;
  challenge: Challenge;
  assignedAt?: string;
}

// Pagination types for Spring Boot Page responses
export interface Sort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

export interface Pageable {
  offset: number;
  sort: Sort;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

export interface PagedResponse<T> {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number;
  sort: Sort;
  numberOfElements: number;
  pageable: Pageable;
  empty: boolean;
}
