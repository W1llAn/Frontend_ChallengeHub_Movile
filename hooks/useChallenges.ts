import { useState, useCallback } from "react";
import {
    getChallengesByCategory,
    getChallengeById,
    getAllChallenges
} from "@/services/challenge.service";
import type { Challenge, PagedResponse } from "@/types/api/challenge.type";
import { showNotifier } from "@/services/notifier";

/**
 * Hook para manejar operaciones de challenges
 */
export const useChallenges = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [pagedResponse, setPagedResponse] = useState<PagedResponse<Challenge> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Carga los challenges de una categoría específica
     * @param categoryId - ID de la categoría
     * @param page - Número de página (default: 0)
     * @param size - Tamaño de página (default: 10)
     */
    const loadChallengesByCategory = useCallback(
        async (categoryId: number, page: number = 0, size: number = 10) => {
            setLoading(true);
            setError(null);
            try {
                const data = await getChallengesByCategory(categoryId, page, size);
                setPagedResponse(data);
                setChallenges(data.content);
                return data;
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || "Error al cargar los challenges";
                setError(errorMessage);
                showNotifier(errorMessage, "error");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Carga todos los challenges con paginación
     * @param page - Número de página (default: 0)
     * @param size - Tamaño de página (default: 10)
     */
    const loadAllChallenges = useCallback(
        async (page: number = 0, size: number = 10) => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllChallenges(page, size);
                setPagedResponse(data);
                setChallenges(data.content);
                return data;
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || "Error al cargar los challenges";
                setError(errorMessage);
                showNotifier(errorMessage, "error");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Carga un challenge específico por su ID
     * @param id - ID del challenge
     */
    const loadChallengeById = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getChallengeById(id);
            return data;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message || "Error al cargar el challenge";
            setError(errorMessage);
            showNotifier(errorMessage, "error");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Carga más challenges (para paginación infinita)
     * @param categoryId - ID de la categoría (opcional)
     * @param page - Número de página
     * @param size - Tamaño de página
     */
    const loadMoreChallenges = useCallback(
        async (categoryId?: number, page: number = 0, size: number = 10) => {
            setLoading(true);
            setError(null);
            try {
                const data = categoryId
                    ? await getChallengesByCategory(categoryId, page, size)
                    : await getAllChallenges(page, size);

                setPagedResponse(data);
                // Append new challenges to existing ones
                setChallenges((prev) => [...prev, ...data.content]);
                return data;
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || "Error al cargar más challenges";
                setError(errorMessage);
                showNotifier(errorMessage, "error");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Reinicia el estado de challenges
     */
    const resetChallenges = useCallback(() => {
        setChallenges([]);
        setPagedResponse(null);
        setError(null);
    }, []);

    return {
        challenges,
        pagedResponse,
        loading,
        error,
        loadChallengesByCategory,
        loadAllChallenges,
        loadChallengeById,
        loadMoreChallenges,
        resetChallenges,
    };
};
