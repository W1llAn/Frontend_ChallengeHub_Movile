import api from "../api/api";
import {
  ChallengeSettingsResponseDTO,
  ChallengeSettingsUpsertDTO,
} from "../types/api/challengeSettings.type";

/**
 * Servicio para gestionar la configuración de validación por reto
 * Permite crear, actualizar, obtener y eliminar settings de un reto
 */
export const ChallengeSettingsService = {
  /**
   * Crear o actualizar los settings de un reto
   * 
   * @param challengeId ID del reto
   * @param payload Configuración: tipo de validación, frecuencia, revisión manual, puntos
   * @returns Configuración guardada
   * 
   * Ejemplo:
   * ```typescript
   * const settings = await ChallengeSettingsService.upsert(123, {
   *   challengeId: 123,
   *   validationType: 'PDF',
   *   frequency: 'WEEKLY',
   *   requireReview: true,
   *   pointsPerSubmission: 10,
   * });
   * ```
   */
  upsert: async (
    challengeId: number,
    payload: ChallengeSettingsUpsertDTO
  ): Promise<ChallengeSettingsResponseDTO> => {
    console.log(
      `🔧 ChallengeSettingsService.upsert - challengeId: ${challengeId}`,
      payload
    );
    const { data } = await api.put(
      `/challenges/${challengeId}/settings`,
      payload
    );
    console.log("✅ Settings guardados:", data);
    return data;
  },

  /**
   * Obtener los settings vigentes de un reto
   * 
   * @param challengeId ID del reto
   * @returns Configuración del reto para validar envíos
   * 
   * La configuración incluye:
   * - validationType: Tipo de validación esperado (PHOTO o PDF)
   * - frequency: Frecuencia con la que se pueden enviar avances
   * - requireReview: Si los envíos necesitan revisión manual
   * - pointsPerSubmission: Puntos otorgados por envío aprobado
   */
  getByChallenge: async (
    challengeId: number
  ): Promise<ChallengeSettingsResponseDTO> => {
    console.log(
      `🔧 ChallengeSettingsService.getByChallenge - challengeId: ${challengeId}`
    );
    const { data } = await api.get(
      `/challenges/${challengeId}/settings`
    );
    console.log("✅ Settings obtenidos:", data);
    return data;
  },

  /**
   * Eliminar los settings de un reto
   * 
   * @param challengeId ID del reto
   * 
   * Es idempotente: si no existen settings, aún retorna éxito (204)
   */
  deleteByChallenge: async (challengeId: number): Promise<void> => {
    console.log(
      `🔧 ChallengeSettingsService.deleteByChallenge - challengeId: ${challengeId}`
    );
    await api.delete(`/challenges/${challengeId}/settings`);
    console.log("✅ Settings eliminados");
  },
};
