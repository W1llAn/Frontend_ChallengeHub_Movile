/**
 * DTO for creating a user-challenge relationship
 */
export interface UserChallengeCreateDTO {
    userId: number;
    challengeId: number;
}

/**
 * Response DTO for user-challenge relationship
 */
export interface UserChallengeResponseDTO {
    id: number;
    userId: number;
    username: string;
    challengeId: number;
    challengeTitle: string;
}
