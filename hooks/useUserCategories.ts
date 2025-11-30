import { useState, useCallback } from "react";
import {
  getUserCategories,
  deleteUserCategory,
  getChallengesByUserCategory,
  getCreatorsByCategoryOrdered,
} from "@/services/user-category.service";
import type {
  UserCategory,
  UserCategoryChallenge,
  DeleteUserCategoryParams,
  GetChallengesByCategoryParams,
  CreatorChallengeCount,
} from "@/types/api/user-category.type";
import { showNotifier } from "@/services/notifier";

/**
 * Hook para manejar las categorías de interés del usuario
 */
export const useUserCategories = () => {
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserCategories = useCallback(async (userId: number) => {
    if (!userId) {
      setError("ID de usuario no válido");
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getUserCategories(userId);
      setCategories(data);
      return data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Error al cargar categorías del usuario";
      setError(errorMessage);
      showNotifier(errorMessage, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUserCategory = useCallback(
    async (params: DeleteUserCategoryParams) => {
      setLoading(true);
      setError(null);
      try {
        await deleteUserCategory(params);
        setCategories((prev) =>
          prev.filter((cat) => cat.categoryId !== params.categoryId)
        );
        showNotifier("Categoría eliminada exitosamente", "success");
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || "Error al eliminar categoría";
        setError(errorMessage);
        showNotifier(errorMessage, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadChallenges = useCallback(
    async (params: GetChallengesByCategoryParams): Promise<UserCategoryChallenge[]> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getChallengesByUserCategory(params);
        return data;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || "Error al cargar desafíos";
        setError(errorMessage);
        showNotifier(errorMessage, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadTopCreators = useCallback(
    async (categoryId: number): Promise<CreatorChallengeCount[]> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCreatorsByCategoryOrdered(categoryId);
        return data;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || "Error al cargar creadores";
        setError(errorMessage);
        showNotifier(errorMessage, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshCategories = useCallback(
    async (userId: number) => {
      return loadUserCategories(userId);
    },
    [loadUserCategories]
  );

  return {
    categories,
    loading,
    error,
    loadUserCategories,
    removeUserCategory,
    loadChallenges,
    loadTopCreators,
    refreshCategories,
    setCategories,
  };
};
