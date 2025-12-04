import Api from "../api/api";
import type { Challenge } from "../types/api/challenge.type";
import type { UserChallengeCreateDTO, UserChallengeResponseDTO } from "../types/api/user-challenge.type";

export interface UserChallengeBasic {
  id: number;
  userId: number;
  username: string;
  challengeId: number;
  challengeTitle: string;
}

/**
 * Assign a user to a challenge (subscribe)
 */
export const assignUserToChallenge = async (dto: UserChallengeCreateDTO): Promise<UserChallengeResponseDTO> => {
  const { data } = await Api.post<UserChallengeResponseDTO>('/user-challenges', dto);
  return data;
};

/**
 * Unassign a user from a challenge (unsubscribe)
 */
export const unassignUserFromChallenge = async (userId: number, challengeId: number): Promise<void> => {
  await Api.delete(`/user-challenges`, {
    params: { userId, challengeId }
  });
};

/**
 * Get all challenges assigned to a user
 */
export const listChallengesByUser = async (userId: number): Promise<UserChallengeResponseDTO[]> => {
  const { data } = await Api.get<UserChallengeResponseDTO[]>(`/user-challenges/by-user/${userId}`);
  return data;
};

/**
 * Get all users assigned to a challenge
 */
export const listUsersByChallenge = async (challengeId: number): Promise<UserChallengeResponseDTO[]> => {
  const { data } = await Api.get<UserChallengeResponseDTO[]>(`/user-challenges/by-challenge/${challengeId}`);
  return data;
};

/**
 * Check if a user is subscribed to a challenge
 */
export const isUserSubscribed = async (userId: number, challengeId: number): Promise<boolean> => {
  try {
    const userChallenges = await listChallengesByUser(userId);
    return userChallenges.some(uc => uc.challengeId === challengeId);
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};

export const getUserChallengesWithDetails = async (userId: number): Promise<Challenge[]> => {
  // 1. Obtener la lista básica
  const { data: userChallenges } = await Api.get<UserChallengeBasic[]>(`/user-challenges/by-user/${userId}`);

  // 2. Obtener detalles de cada challenge
  const challengeDetails = await Promise.all(
    userChallenges.map(async (uc) => {
      try {
        const { data: challenge } = await Api.get<Challenge>(`/challenges/${uc.challengeId}`);
        return challenge;
      } catch {
        // Si falla, retorna solo los datos básicos
        return {
          id: uc.challengeId,
          title: uc.challengeTitle,
          description: "",
          categoryId: 0,
          creatorId: 0,
        } as Challenge;
      }
    })
  );

  return challengeDetails;
};
