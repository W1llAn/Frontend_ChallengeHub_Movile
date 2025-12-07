// src/services/badge.service.ts
import api from "../api/api";
import {
  BadgeCreateDTO,
  BadgeUpdateDTO,
  BadgeResponseDTO,
} from "../types/api/badge.type";

import {
  BadgesDifficulty,
  BadgeWithUserCountDTO,
  CreateUserBadgeDTO,
  UserBadgeResponseDTO,
  UserBadgesSummaryDTO,
} from "../types/api/userBadge.type";

export const BadgeService = {
  /** Obtener todas las insignias paginadas */
  listPaged: async (page = 0, size = 10) => {
    const { data } = await api.get(`/badges`, {
      params: { page, size },
    });
    return data; // Page<BadgeResponseDTO>
  },

  /** Obtener insignia por ID */
  getById: async (id: number): Promise<BadgeResponseDTO> => {
    const { data } = await api.get(`/badges/${id}`);
    return data;
  },

  /** Crear insignia */
  create: async (payload: BadgeCreateDTO): Promise<BadgeResponseDTO> => {
    const { data } = await api.post(`/badges`, payload);
    return data;
  },

  /** Actualizar insignia */
  update: async (
    id: number,
    payload: BadgeUpdateDTO
  ): Promise<BadgeResponseDTO> => {
    const { data } = await api.put(`/badges/${id}`, payload);
    return data;
  },

  /** Eliminar insignia */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/badges/${id}`);
  },

  /** Obtener badges filtrados por dificultad (paginados) */
  listByDifficulty: async (
    difficulty: BadgesDifficulty,
    page = 0,
    size = 10
  ) => {
    const { data } = await api.get(
      `/badges/difficulty/${difficulty}`,
      { params: { page, size } }
    );
    return data; // Page<BadgeResponseDTO>
  },

  /** Obtener badges con conteo de usuarios */
  listWithUserCount: async (): Promise<BadgeWithUserCountDTO[]> => {
    const { data } = await api.get(`/badges/with-user-count`);
    return data;
  },

  /** Conteo de usuarios por badge */
  getUserCountByBadge: async (id: number): Promise<number> => {
    const { data } = await api.get(`/badges/${id}/user-count`);
    return data; // number
  },

  /** Obtener insignias filtrando por dificultad (devuelve con conteo de usuarios) */
  getBadgesWithUserCountByDifficulty: async (
    difficulty: BadgesDifficulty
  ): Promise<BadgeWithUserCountDTO[]> => {
    const { data } = await api.get(
      `/badges/with-user-count?difficulty=${difficulty}`
    );
    return data;
  },

  // ============== ENDPOINTS DE USER BADGES ==============

  /**
   * Obtener todas las asignaciones usuario-insignia paginadas
   * @param page Número de página (0-based)
   * @param size Tamaño de la página
   * @returns Página con asignaciones de insignias
   */
  listAllUserBadges: async (page = 0, size = 10) => {
    const { data } = await api.get(`/user-badges`, {
      params: { page, size },
    });
    return data; // Page<UserBadgeResponseDTO>
  },

  /**
   * Obtener asignación usuario-insignia por ID
   * @param id ID de la asignación
   * @returns Detalles de la asignación
   */
  getUserBadgeById: async (id: number): Promise<UserBadgeResponseDTO> => {
    const { data } = await api.get(`/user-badges/${id}`);
    return data;
  },

  /**
   * Asignar insignia a usuario (requiere rol ADMIN)
   * @param payload Datos: userId y badgeId
   * @returns Asignación creada
   */
  assignBadgeToUser: async (
    payload: CreateUserBadgeDTO
  ): Promise<UserBadgeResponseDTO> => {
    const { data } = await api.post(`/user-badges`, payload);
    return data;
  },

  /**
   * Remover insignia de usuario (requiere rol ADMIN)
   * @param userBadgeId ID de la asignación a eliminar
   */
  removeBadgeFromUser: async (userBadgeId: number): Promise<void> => {
    await api.delete(`/user-badges/${userBadgeId}`);
  },

  /**
   * Obtener insignias por usuario (paginado)
   * @param userId ID del usuario
   * @param page Número de página (0-based)
   * @param size Tamaño de la página
   * @returns Página con insignias del usuario
   */
  getBadgesByUser: async (userId: number, page = 0, size = 10) => {
    const { data } = await api.get(`/user-badges/user/${userId}`, {
      params: { page, size },
    });
    return data; // Page<UserBadgeResponseDTO>
  },

  /**
   * Obtener resumen de insignias por usuario
   * Retorna conteo total y lista detallada de insignias
   * @param userId ID del usuario
   * @returns Resumen de insignias del usuario
   */
  getUserBadgesSummary: async (
    userId: number
  ): Promise<UserBadgesSummaryDTO> => {
    const { data } = await api.get(`/user-badges/user/${userId}/summary`);
    return data;
  },

  /**
   * Obtener usuarios por insignia (paginado)
   * @param badgeId ID de la insignia
   * @param page Número de página (0-based)
   * @param size Tamaño de la página
   * @returns Página con usuarios que tienen esa insignia
   */
  getUsersByBadge: async (badgeId: number, page = 0, size = 10) => {
    const { data } = await api.get(`/user-badges/badge/${badgeId}`, {
      params: { page, size },
    });
    return data; // Page<UserBadgeResponseDTO>
  },
};
