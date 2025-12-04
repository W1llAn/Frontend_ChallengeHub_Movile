// services/comment.service.ts
import { api } from '../api/api';
import type {
    CommentResponseDTO,
    CommentCreateDTO,
    CommentUpdateDTO,
    CommentStatus,
} from '../types/api/comment.type';

/**
 * Get all comments for a specific challenge
 * GET /api/comments/challenge/{challengeId}
 */
export const getCommentsByChallenge = async (
    challengeId: number
): Promise<CommentResponseDTO[]> => {
    try {
        const { data } = await api.get<CommentResponseDTO[]>(
            `/comments/challenge/${challengeId}`
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all comments by a specific user
 * GET /api/comments/user/{userId}
 */
export const getCommentsByUser = async (
    userId: number
): Promise<CommentResponseDTO[]> => {
    try {
        const { data } = await api.get<CommentResponseDTO[]>(
            `/comments/user/${userId}`
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get comments by status
 * GET /api/comments/status/{status}
 */
export const getCommentsByStatus = async (
    status: CommentStatus
): Promise<CommentResponseDTO[]> => {
    try {
        const { data } = await api.get<CommentResponseDTO[]>(
            `/comments/status/${status}`
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get comments by challenge and status
 * GET /api/comments/challenge/{challengeId}/status/{status}
 */
export const getCommentsByChallengeAndStatus = async (
    challengeId: number,
    status: CommentStatus
): Promise<CommentResponseDTO[]> => {
    try {
        const { data } = await api.get<CommentResponseDTO[]>(
            `/comments/challenge/${challengeId}/status/${status}`
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Search comments by content
 * GET /api/comments/search?content={content}
 */
export const searchCommentsByContent = async (
    content: string
): Promise<CommentResponseDTO[]> => {
    try {
        const { data } = await api.get<CommentResponseDTO[]>('/comments/search', {
            params: { content },
        });
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Count valid comments for a challenge
 * GET /api/comments/challenge/{challengeId}/count
 */
export const countValidCommentsByChallenge = async (
    challengeId: number
): Promise<number> => {
    try {
        const { data } = await api.get<number>(
            `/comments/challenge/${challengeId}/count`
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new comment
 * POST /api/comments
 */
export const createComment = async (
    dto: CommentCreateDTO
): Promise<CommentResponseDTO> => {
    try {
        const { data } = await api.post<CommentResponseDTO>('/comments', dto);
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update a comment
 * PUT /api/comments/{id}
 */
export const updateComment = async (
    id: number,
    dto: CommentUpdateDTO
): Promise<CommentResponseDTO> => {
    try {
        const { data } = await api.put<CommentResponseDTO>(`/comments/${id}`, dto);
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update comment status
 * PATCH /api/comments/{id}/status
 */
export const updateCommentStatus = async (
    id: number,
    status: CommentStatus
): Promise<CommentResponseDTO> => {
    try {
        const { data } = await api.patch<CommentResponseDTO>(
            `/comments/${id}/status`,
            null,
            { params: { status } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a comment
 * DELETE /api/comments/{id}
 */
export const deleteComment = async (
    id: number
): Promise<CommentResponseDTO> => {
    try {
        const { data } = await api.delete<CommentResponseDTO>(`/comments/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};
