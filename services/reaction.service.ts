// services/reaction.service.ts
import { api } from "../api/api";
import type {
    Reaction,
    ChallengeReactionCreateDTO,
    ChallengeReactionResponseDTO,
} from "../types/api/reaction.type";

/**
 * Get all available reactions
 * GET /api/reactions
 */
export const getAllReactions = async (): Promise<Reaction[]> => {
    try {
        const { data } = await api.get<Reaction[]>("/reactions");
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Add a reaction to a challenge
 * POST /api/reactions/add
 * @param dto - Challenge reaction data
 */
export const addReactionToChallenge = async (
    dto: ChallengeReactionCreateDTO
): Promise<ChallengeReactionResponseDTO> => {
    try {
        const { data } = await api.post<ChallengeReactionResponseDTO>(
            "/reactions/add",
            dto
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Remove a reaction from a challenge
 * DELETE /api/reactions
 * @param challengeId - Challenge ID
 * @param userId - User ID
 */
export const removeReactionFromChallenge = async (
    challengeId: number,
    userId: number
): Promise<void> => {
    try {
        await api.delete("/reactions", {
            params: { challengeId, userId },
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Get all reactions for a specific challenge
 * GET /api/reactions/by-challenge/{challengeId}
 * @param challengeId - Challenge ID
 */
export const getReactionsByChallenge = async (
    challengeId: number
): Promise<ChallengeReactionResponseDTO[]> => {
    try {
        const { data } = await api.get<ChallengeReactionResponseDTO[]>(
            `/reactions/by-challenge/${challengeId}`
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all reactions by a specific user
 * GET /api/reactions/by-user/{userId}
 * @param userId - User ID
 */
export const getReactionsByUser = async (
    userId: number
): Promise<ChallengeReactionResponseDTO[]> => {
    try {
        const { data } = await api.get<ChallengeReactionResponseDTO[]>(
            `/reactions/by-user/${userId}`
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete all reactions from a challenge (admin/physical delete)
 * DELETE /api/reactions/by-challenge/{challengeId}/physical
 * @param challengeId - Challenge ID
 */
export const deleteAllReactionsByChallenge = async (
    challengeId: number
): Promise<void> => {
    try {
        await api.delete(`/reactions/by-challenge/${challengeId}/physical`);
    } catch (error) {
        throw error;
    }
};
