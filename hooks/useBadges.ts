import { useEffect, useState } from "react";
import { UserBadgeService } from "../services/userBadge.service";
import { UserBadgesSummaryDTO } from "../types/api/userBadge.type";

interface UseBadgesReturn {
  userBadges: UserBadgesSummaryDTO | null;
  loading: boolean;
  error: string | null;
  refreshBadges: () => Promise<void>;
  totalBadges: number;
}

export const useBadges = (userId: number | null): UseBadgesReturn => {
  const [userBadges, setUserBadges] = useState<UserBadgesSummaryDTO | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBadges = async () => {
    if (!userId) {
      setError("Usuario no identificado");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await UserBadgeService.getUserSummary(userId);
      setUserBadges(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar insignias";
      setError(errorMsg);
      console.error("Error fetching user badges:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshBadges = async () => {
    await fetchUserBadges();
  };

  useEffect(() => {
    if (userId) {
      fetchUserBadges();
    }
  }, [userId]);

  return {
    userBadges,
    loading,
    error,
    refreshBadges,
    totalBadges: userBadges?.totalBadges || 0,
  };
};
