import { useState, useCallback, useEffect } from 'react';
import { listUsersByChallenge } from '@/services/user-challenge.service';
import { SubmissionService } from '@/services/submission.service';
import { UserChallengePointsDTO } from '@/types/api/submission.type';

/**
 * Representa un usuario con su puntuación en un reto específico
 */
export interface UserScore {
  userId: number;
  username: string;
  totalPoints: number;
  progressPercent: number;
  approvedSubmissionsCount: number;
}

/**
 * Hook para obtener el top 3 de usuarios con mayor puntuación en un reto
 * @param challengeId ID del reto
 * @returns { topScores, loading, error }
 */
export const useChallengeTopScores = (challengeId: number | null | undefined) => {
  const [topScores, setTopScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTopScores = useCallback(async () => {
    if (!challengeId) {
      setTopScores([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // PASO 1: Obtener todos los usuarios suscritos al reto
      const subscribedUsers = await listUsersByChallenge(challengeId);

      if (subscribedUsers.length === 0) {
        setTopScores([]);
        return;
      }

      // PASO 2: Obtener puntos para cada usuario
      const usersWithPoints = await Promise.all(
        subscribedUsers.map(async (user) => {
          try {
            const pointsData: UserChallengePointsDTO = await SubmissionService.getPointsByUserAndChallenge(
              user.userId,
              challengeId
            );

            return {
              userId: user.userId,
              username: user.username,
              totalPoints: pointsData.totalPoints || 0,
              progressPercent: pointsData.progressPercent || 0,
              approvedSubmissionsCount: pointsData.approvedSubmissionsCount || 0,
            };
          } catch (err) {
            // Si falla obtener puntos, retornar usuario con 0 puntos
            console.warn(`Error getting points for user ${user.userId}:`, err);
            return {
              userId: user.userId,
              username: user.username,
              totalPoints: 0,
              progressPercent: 0,
              approvedSubmissionsCount: 0,
            };
          }
        })
      );

      // PASO 3: Ordenar por puntos (descendente) y tomar top 3
      const top3 = usersWithPoints
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 3);

      setTopScores(top3);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar el leaderboard';
      console.error('Error en useChallengeTopScores:', errorMessage);
      setError(errorMessage);
      setTopScores([]);
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    loadTopScores();
  }, [loadTopScores]);

  const refresh = useCallback(async () => {
    await loadTopScores();
  }, [loadTopScores]);

  return {
    topScores,
    loading,
    error,
    refresh,
  };
};
