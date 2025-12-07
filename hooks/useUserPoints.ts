import { useEffect, useState } from "react";
import { SubmissionService } from "../services/submission.service";
import { UserTotalPointsDTO } from "../types/api/submission.type";

interface UseUserPointsReturn {
  userPoints: UserTotalPointsDTO | null;
  loading: boolean;
  error: string | null;
  refreshPoints: () => Promise<void>;
  totalPoints: number;
}

export const useUserPoints = (userId: number | null): UseUserPointsReturn => {
  const [userPoints, setUserPoints] = useState<UserTotalPointsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPoints = async () => {
    if (!userId) {
      setError("Usuario no identificado");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await SubmissionService.getTotalPointsByUser(userId);
      setUserPoints(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar puntos";
      setError(errorMsg);
      console.error("Error fetching user points:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshPoints = async () => {
    if (userId) {
      await fetchUserPoints();
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserPoints();
    }
  }, [userId]);

  return {
    userPoints,
    loading,
    error,
    refreshPoints,
    totalPoints: userPoints?.totalPoints || 0,
  };
};
