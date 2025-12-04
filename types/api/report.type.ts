/**
 * Types para Reports API
 */

export type ReportReason =
  | "FRAUD"
  | "SELF_HARM_INCITEMENT"
  | "HATE_COMMENTS"
  | "INAPPROPRIATE_LANGUAGE"
  | "HARASSMENT"
  | "SPAM"
  | "VIOLENCE"
  | "ILLEGAL_CONTENT"
  | "COPYRIGHT_VIOLATION"
  | "MISINFORMATION"
  | "OTHER";

export type ReportObjectType = "USER" | "CHALLENGE" | "COMMENT";

export interface CreateReportDTO {
  title: string;
  reason: ReportReason;
  description: string;
  objectType: ReportObjectType;
  objectId: number;
  reporterId: number;
}

export interface ReportResponseDTO {
  id: number;
  title: string;
  reason: ReportReason;
  description: string;
  objectType: ReportObjectType;
  objectId: number;
  reporterId: number;
  status: string;
  createdAt: string;
}

export const REPORT_REASONS: { label: string; value: ReportReason }[] = [
  { label: "Fraude", value: "FRAUD" },
  { label: "Incitación al autolesión", value: "SELF_HARM_INCITEMENT" },
  { label: "Comentarios de odio", value: "HATE_COMMENTS" },
  { label: "Lenguaje inapropiado", value: "INAPPROPRIATE_LANGUAGE" },
  { label: "Acoso", value: "HARASSMENT" },
  { label: "Spam", value: "SPAM" },
  { label: "Violencia", value: "VIOLENCE" },
  { label: "Contenido ilegal", value: "ILLEGAL_CONTENT" },
  { label: "Violación de derechos de autor", value: "COPYRIGHT_VIOLATION" },
  { label: "Información falsa", value: "MISINFORMATION" },
  { label: "Otro", value: "OTHER" },
];
