export type ValidationType = "PHOTO" | "PDF";
export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type FileRole = "EVIDENCE" | "SUPPORTING_DOCUMENT";

export interface SubmissionCreateDTO {
  userChallengeId: number;
  type: ValidationType;
}

export interface SubmissionFileCreateDTO {
  fileId: number;
  role: FileRole;
}

export interface SubmissionUpdateDTO {
  type: ValidationType;
  fileId?: number; 
}

/**
 * @deprecated Usar SubmissionUpdateDTO en su lugar
 */
export interface SubmissionFileUpdateDTO {
  fileId: number;
  role: FileRole;
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

export interface FileResponseDTO {
  id: number;
  filename: string;
  bucket: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  expiresAt: string;
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

export interface UserChallengePointsDTO {
  challengeId: number;
  challengeTitle: string;
  totalPoints: number;
  approvedSubmissionsCount: number;
  progressPercent: number;
}

export interface UserTotalPointsDTO {
  userId: number;
  username: string;
  totalPoints: number;
  pointsByChallenge: UserChallengePointsDTO[];
}


