import { useState, useCallback } from 'react';
import { SubmissionService } from '@/services/submission.service';
import { UserChallengePointsDTO } from '@/types/api/submission.type';

interface UseSubmissionProgressReturn {
  userProgress: UserChallengePointsDTO | null;
  loading: boolean;
  error: string | null;
  loadProgress: (userId: number, challengeId: number) => Promise<void>;
  refreshProgress: (userId: number, challengeId: number) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook para obtener y actualizar el progreso del usuario en un reto específico
 * Utiliza el endpoint getPointsByUserAndChallenge del backend
 */
export const useSubmissionProgress = (): UseSubmissionProgressReturn => {
  const [userProgress, setUserProgress] = useState<UserChallengePointsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(
    async (userId: number, challengeId: number) => {
      if (!userId || !challengeId) {
        setError('Usuario o reto no identificado');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await SubmissionService.getPointsByUserAndChallenge(userId, challengeId);
        setUserProgress(data);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar el progreso';
        console.error('❌ Error cargando progreso:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshProgress = useCallback(
    async (userId: number, challengeId: number) => {
      await loadProgress(userId, challengeId);
    },
    [loadProgress]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    userProgress,
    loading,
    error,
    loadProgress,
    refreshProgress,
    clearError,
  };
};
