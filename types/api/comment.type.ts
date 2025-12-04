// types/api/comment.type.ts

/**
 * Comment status enum
 */
export enum CommentStatus {
    VALID = 'VALID',
    REPORTED = 'REPORTED',
    INVALID = 'INVALID',
}

/**
 * Comment Response DTO
 * Maps to backend CommentResponseDTO
 */
export interface CommentResponseDTO {
    id: number;
    content: string;
    status: CommentStatus;
    createdAt: string;
    userId: number;
    userName: string;
    challengeId: number;
    challengeTitle: string;
}

/**
 * DTO for creating a comment
 * Maps to backend CommentCreateDTO
 */
export interface CommentCreateDTO {
    content: string;
    userId: number;
    challengeId: number;
}

/**
 * DTO for updating a comment
 * Maps to backend CommentUpdateDTO
 */
export interface CommentUpdateDTO {
    content: string;
    status?: CommentStatus;
}
