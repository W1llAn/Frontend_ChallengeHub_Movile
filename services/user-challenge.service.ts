import Api from "../api/api";
import type { Challenge } from "../types/api/challenge.type";

export interface UserChallengeBasic {
  id: number;
  userId: number;
  username: string;
  challengeId: number;
  challengeTitle: string;
}

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
