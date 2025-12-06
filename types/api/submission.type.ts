export type ValidationType = "PHOTO" | "PDF";
export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type FileRole = "EVIDENCE";

export interface SubmissionCreateDTO {
  userChallengeId: number;
  fileId: string | number; // ID del archivo subido (obtenido de ImageService.uploadPdf o upload)
  type: ValidationType;
  // Nota: periodKey se genera automáticamente en el servidor como la fecha actual (hoy)
  // No es necesario enviarlo desde el frontend
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
