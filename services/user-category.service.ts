// services/user-category.service.ts
import Api from "../api/api";
import type {
  UserCategory,
  UserCategoryChallenge,
  DeleteUserCategoryParams,
  GetChallengesByCategoryParams,
  CreatorChallengeCount,
} from "../types/api/user-category.type";

/**
 * Obtiene las categorías de interés de un usuario
 */
export const getUserCategories = async (
  userId: number
): Promise<UserCategory[]> => {
  try {
    const response = await Api.get<UserCategory[]>(
      `/user-categories/by-user/${userId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Obtiene los desafíos de una categoría específica de un usuario
 */
export const getChallengesByUserCategory = async (
  params: GetChallengesByCategoryParams
): Promise<UserCategoryChallenge[]> => {
  try {
    const response = await Api.get<UserCategoryChallenge[]>(
      `/user-categories/challenges-user-category`,
      {
        params: {
          userId: params.userId,
          categoryId: params.categoryId,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Elimina una categoría de interés de un usuario
 */
export const deleteUserCategory = async (
  params: DeleteUserCategoryParams
): Promise<void> => {
  try {
    await Api.delete(`/user-categories`, {
      params: {
        userId: params.userId,
        categoryId: params.categoryId,
      },
    });
  } catch (error: any) {
    throw error;
  }
};

/**
 * Obtiene los creadores ordenados por cantidad de desafíos en una categoría
 */
export const getCreatorsByCategoryOrdered = async (
  categoryId: number
): Promise<CreatorChallengeCount[]> => {
  try {
    const response = await Api.get<CreatorChallengeCount[]>(
      `/user-categories/creators-by-category/${categoryId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
