import { useState, useCallback } from "react";
import { getAllCategories, addUserCategory } from "@/services/category.service";
import type { Category, AddUserCategoryParams } from "@/types/api/category.type";
import { showNotifier } from "@/services/notifier";

/**
 * Hook para manejar operaciones de categorías
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCategories();
      setCategories(data);
      return data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Error al cargar categorías";
      setError(errorMessage);
      showNotifier(errorMessage, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(async (params: AddUserCategoryParams) => {
    setLoading(true);
    setError(null);
    try {
      await addUserCategory(params);
      showNotifier("Categoría agregada exitosamente", "success");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Error al agregar categoría";
      setError(errorMessage);
      showNotifier(errorMessage, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    loadAllCategories,
    addCategory,
  };
};
