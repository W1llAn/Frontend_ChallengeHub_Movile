import { useEffect, useState, useCallback } from "react";
import { getUserChallengesWithDetails } from "../services/user-challenge.service";
import type { Challenge } from "../types/api/challenge.type";
import { useUsers } from "./useUsers";

export const useUserChallenges = () => {
  const { currentUser } = useUsers();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserChallengesWithDetails(currentUser.id);
      setChallenges(data);
    } catch (err) {
      setError("Error al cargar los retos");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return { challenges, loading, error, refetch: fetchChallenges };
};
