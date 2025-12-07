import { useCallback, useEffect, useState } from "react";
import { BadgeService } from "../services/badge.service";
import { SubmissionService } from "../services/submission.service";
import { UserBadgeResponseDTO } from "../types/api/userBadge.type";
import { UserTotalPointsDTO } from "../types/api/submission.type";

interface BadgeAward {
  badgeId: number;
  badgeName: string;
  completedChallenges: number;
}

interface UseBadgeLogicReturn {
  completedChallengesCount: number;
  unlockedBadges: BadgeAward[];
  loading: boolean;
  error: string | null;
  checkAndAwardBadges: (userId: number) => Promise<BadgeAward[]>;
  isChallengeFull: (progressPercent: number) => boolean;
}

/**
 * Hook para gestionar la lógica de medallas
 * - Verifica si un reto está completo (100%)
 * - Cuenta retos completados
 * - Otorga medallas automáticamente
 */
export const useBadgeLogic = (): UseBadgeLogicReturn => {
  const [completedChallengesCount, setCompletedChallengesCount] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Mapeo de medallas basado en retos completados
   * ID de medalla -> número de retos requeridos
   */
  const BADGE_THRESHOLDS = {
    1: 1, // Bronze - 1 reto completado
    2: 10, // Silver - 10 retos completados
    3: 20, // Gold - 20 retos completados
    4: 50, // Diamond - 50 retos completados
  };

  /**
   * Verifica si un reto está completo (100%)
   */
  const isChallengeFull = useCallback((progressPercent: number): boolean => {
    return progressPercent >= 100;
  }, []);

  /**
   * Obtiene el nombre de la medalla
   */
  const getBadgeName = (badgeId: number): string => {
    const names: Record<number, string> = {
      1: "Insignia de Bronce",
      2: "Insignia de Plata",
      3: "Insignia de Oro",
      4: "Insignia de Diamante",
    };
    return names[badgeId] || "Insignia Desconocida";
  };

  /**
   * Determina qué medallas debe obtener el usuario
   */
  const calculateEarnerBadges = (
    completedCount: number,
    userBadges: UserBadgeResponseDTO[]
  ): BadgeAward[] => {
    const userBadgeIds = new Set(userBadges.map((b) => b.badgeId));
    const newBadges: BadgeAward[] = [];

    Object.entries(BADGE_THRESHOLDS).forEach(([badgeId, threshold]) => {
      const badgeIdNum = parseInt(badgeId);
      // Si el usuario tiene suficientes retos completados y no tiene la medalla
      if (completedCount >= threshold && !userBadgeIds.has(badgeIdNum)) {
        newBadges.push({
          badgeId: badgeIdNum,
          badgeName: getBadgeName(badgeIdNum),
          completedChallenges: completedCount,
        });
      }
    });

    return newBadges;
  };

  /**
   * Verifica y otorga medallas si el usuario las ha ganado
   */
  const checkAndAwardBadges = useCallback(
    async (userId: number): Promise<BadgeAward[]> => {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener puntos y retos completados del usuario
        const userPoints: UserTotalPointsDTO =
          await SubmissionService.getTotalPointsByUser(userId);

        // 2. Contar retos con 100% de progreso
        const completedCount = userPoints.pointsByChallenge.filter(
          (challenge: { progressPercent: number }) => challenge.progressPercent >= 100
        ).length;

        setCompletedChallengesCount(completedCount);

        // 3. Obtener insignias actuales del usuario
        const currentBadges = await BadgeService.getUserBadgesSummary(userId);

        // 4. Determinar qué medallas debería obtener
        const newBadges = calculateEarnerBadges(
          completedCount,
          currentBadges.badges as any
        );

        // 5. Asignar nuevas medallas
        for (const badge of newBadges) {
          try {
            await BadgeService.assignBadgeToUser({
              userId,
              badgeId: badge.badgeId,
            });
          } catch (err) {
            console.error(`Error asignando medalla ${badge.badgeId}:`, err);
          }
        }

        setUnlockedBadges(newBadges);
        return newBadges;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error verificando medallas";
        setError(errorMsg);
        console.error("Error en checkAndAwardBadges:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    completedChallengesCount,
    unlockedBadges,
    loading,
    error,
    checkAndAwardBadges,
    isChallengeFull,
  };
};
