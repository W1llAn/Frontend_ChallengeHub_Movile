export type ValidationType = "PHOTO" | "PDF";
export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type FileRole = "EVIDENCE";

export interface SubmissionCreateDTO {
  userChallengeId: number;
  periodKey: string; // LocalDate -> string YYYY-MM-DD
  type: ValidationType;
  fileIds: number[];
}

export interface SubmissionReviewDTO {
  status: SubmissionStatus; // approved | rejected
  feedback?: string;
  pointsAwarded: number;
}

export interface SubmissionFileResponseDTO {
  id: number;
  fileId: number;
  role: FileRole;
  createdAt: string;
  file: FileResponseDTO;
}


export interface SubmissionResponseDTO {
  id: number;
  userChallengeId: number;
  periodKey: string; 
  type: ValidationType;
  status: SubmissionStatus;
  reviewedBy: number | null;
  reviewedAt: string | null; 
  feedback: string | null;
  pointsAwarded: number;
  createdAt: string;
  files: SubmissionFileResponseDTO[];
}

export interface FileResponseDTO {
  id: number;
  bucket: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
}
