export type DocumentKind = "OFFICIAL" | "REFERENCE" | "GUIDE";

export interface ChallengeDocumentCreateSuggestion {
  challengeId: number;
  fileId: number;
  title: string;
  notes: string;
  kind: DocumentKind;
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

export interface FileUploadResult {
  fileId: number;
  url: string;
  contentType: string;
  size: number;
  objectKey: string;
  filename: string;
}



export interface PdfUploadResponseDto {
  fileId: number;
  url: string;
  contentType: string;
  fileSize: number;
  filename: string;
  objectKey: string;
  suggestion: ChallengeDocumentCreateSuggestion;
}
