// services/challenge.service.ts
import { api } from "../api/api";
import type { Challenge, PagedResponse } from "../types/api/challenge.type";

/**
 * Obtiene los challenges de una categoría específica con paginación
 * GET /api/challenges/category/{categoryId}
 * @param categoryId - ID de la categoría
 * @param page - Número de página (0-indexed)
 * @param size - Tamaño de página (cantidad de elementos)
 */
export const getChallengesByCategory = async (
    categoryId: number,
    page: number = 0,
    size: number = 10
): Promise<PagedResponse<Challenge>> => {
    try {
        const { data } = await api.get<PagedResponse<Challenge>>(
            `/challenges/category/${categoryId}`,
            {
                params: { page, size }
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtiene un challenge por su ID
 * GET /api/challenges/{id}
 * @param id - ID del challenge
 */
export const getChallengeById = async (id: number): Promise<Challenge> => {
    try {
        const { data } = await api.get<Challenge>(`/challenges/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtiene todos los challenges con paginación
 * GET /api/challenges
 * @param page - Número de página (0-indexed)
 * @param size - Tamaño de página (cantidad de elementos)
 */
export const getAllChallenges = async (
    page: number = 0,
    size: number = 10
): Promise<PagedResponse<Challenge>> => {
    try {
        const { data } = await api.get<PagedResponse<Challenge>>("/challenges", {
            params: { page, size }
        });
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Busca challenges por título
 * GET /api/challenges/search/title
 * @param title - Título o parte del título a buscar
 */
export const searchChallengesByTitle = async (
    title: string
): Promise<Challenge[]> => {
    try {
        const { data } = await api.get<Challenge[]>("/challenges/search/title", {
            params: { title }
        });
        return data;
    } catch (error) {
        throw error;
    }
};

