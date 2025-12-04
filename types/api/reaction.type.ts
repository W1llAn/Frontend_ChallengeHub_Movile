// types/api/reaction.type.ts

/**
 * Reaction entity - represents a type of reaction available in the system
 */
export interface Reaction {
    id: number;
    name: string;
    description: string;
    iconUrl: string; // Emoji or icon URL
}

/**
 * DTO for creating a reaction (admin only)
 */
export interface ReactionCreateDTO {
    name: string;
    description: string;
    iconUrl: string;
}

/**
 * Challenge Reaction - represents a user's reaction to a challenge
 */
export interface ChallengeReaction {
    id: number;
    challengeId: number;
    userId: number;
    reactionId: number;
    reaction?: Reaction; // Optional populated reaction data
    createdAt?: string;
}

/**
 * DTO for adding a reaction to a challenge
 */
export interface ChallengeReactionCreateDTO {
    challengeId: number;
    userId: number;
    reactionId: number;
}

/**
 * Response DTO for challenge reaction
 */
export interface ChallengeReactionResponseDTO {
    id: number;
    challengeId: number;
    userId: number;
    reactionId: number;
    reaction?: Reaction;
    createdAt?: string;
}

/**
 * Aggregated reaction count for a challenge
 */
export interface ReactionCount {
    reaction: Reaction;
    count: number;
    userReacted: boolean; // Whether the current user has this reaction
}
