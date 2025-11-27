// services/category.service.ts
import { api } from "../api/api";
import type { Category, AddUserCategoryParams } from "../types/api/category.type";

/**
 * Obtiene todas las categorías disponibles
 * GET /api/categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const { data } = await api.get<Category[]>("/categories");
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Agrega una categoría a los intereses del usuario
 * POST /api/user-categories
 */
export const addUserCategory = async (
  params: AddUserCategoryParams
): Promise<void> => {
  try {
    await api.post("/user-categories", params);
  } catch (error) {
    throw error;
  }
};
