import { useState, useCallback } from 'react';
import { ChallengeSettingsService } from '@/services/challengeSettings.service';
import {
  ChallengeSettingsResponseDTO,
  ChallengeSettingsUpsertDTO,
} from '@/types/api/challengeSettings.type';

interface UseChallengeSettingsReturn {
  settings: ChallengeSettingsResponseDTO | null;
  loading: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  getSettings: (challengeId: number) => Promise<void>;
  updateSettings: (payload: ChallengeSettingsUpsertDTO) => Promise<ChallengeSettingsResponseDTO>;
  deleteSettings: (challengeId: number) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook personalizado para gestionar los settings de un reto
 * 
 * Permite obtener, actualizar y eliminar la configuración de validación
 * (tipo de validación, frecuencia, revisión manual, puntos)
 */
export const useChallengeSettings = (): UseChallengeSettingsReturn => {
  const [settings, setSettings] = useState<ChallengeSettingsResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene los settings de un reto específico
   * 
   * @param challengeId ID del reto del cual obtener la configuración
   */
  const getSettings = useCallback(
    async (challengeId: number) => {
      if (!challengeId) {
        setSettings(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ChallengeSettingsService.getByChallenge(challengeId);
        setSettings(data);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || 'Error al obtener los settings del reto';
        setError(errorMessage);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Actualiza los settings de un reto
   * 
   * @param payload Configuración a actualizar (incluye challengeId)
   * @returns Los settings actualizados
   * 
   * Ejemplo:
   * ```typescript
   * const updated = await updateSettings({
   *   challengeId: 123,
   *   validationType: 'PDF',
   *   frequency: 'WEEKLY',
   *   requireReview: true,
   *   pointsPerSubmission: 10,
   * });
   * ```
   */
  const updateSettings = useCallback(
    async (payload: ChallengeSettingsUpsertDTO): Promise<ChallengeSettingsResponseDTO> => {
      try {
        setUpdating(true);
        setError(null);

        if (!payload.challengeId) {
          throw new Error('challengeId es requerido');
        }

        const response = await ChallengeSettingsService.upsert(
          payload.challengeId,
          payload
        );
        setSettings(response);
        return response;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || 'Error al actualizar los settings';
        setError(errorMessage);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  /**
   * Elimina los settings de un reto
   * 
   * @param challengeId ID del reto del cual eliminar la configuración
   */
  const deleteSettings = useCallback(
    async (challengeId: number): Promise<void> => {
      try {
        setDeleting(true);
        setError(null);

        if (!challengeId) {
          throw new Error('challengeId es requerido');
        }

        await ChallengeSettingsService.deleteByChallenge(challengeId);
        setSettings(null);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || 'Error al eliminar los settings';
        setError(errorMessage);
        throw err;
      } finally {
        setDeleting(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings,
    loading,
    updating,
    deleting,
    error,
    getSettings,
    updateSettings,
    deleteSettings,
    clearError,
  };
};
