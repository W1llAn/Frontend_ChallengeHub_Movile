// src/services/badge.service.ts
import api from "../api/api";
import {
  BadgeCreateDTO,
  BadgeUpdateDTO,
  BadgeResponseDTO,
} from "../types/api/badge.type";

import { BadgesDifficulty, BadgeWithUserCountDTO } from "../types/api/userBadge.type";

export const BadgeService = {
  /** Obtener todas las insignias paginadas */
  listPaged: async (page = 0, size = 10) => {
    const { data } = await api.get(`/api/badges`, {
      params: { page, size },
    });
    return data; // Page<BadgeResponseDTO>
  },

  /** Obtener insignia por ID */
  getById: async (id: number): Promise<BadgeResponseDTO> => {
    const { data } = await api.get(`/api/badges/${id}`);
    return data;
  },

  /** Crear insignia */
  create: async (payload: BadgeCreateDTO): Promise<BadgeResponseDTO> => {
    const { data } = await api.post(`/api/badges`, payload);
    return data;
  },

  /** Actualizar insignia */
  update: async (
    id: number,
    payload: BadgeUpdateDTO
  ): Promise<BadgeResponseDTO> => {
    const { data } = await api.put(`/api/badges/${id}`, payload);
    return data;
  },

  /** Eliminar insignia */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/badges/${id}`);
  },

  /** Obtener badges filtrados por dificultad (paginados) */
  listByDifficulty: async (
    difficulty: BadgesDifficulty,
    page = 0,
    size = 10
  ) => {
    const { data } = await api.get(
      `/api/badges/difficulty/${difficulty}`,
      { params: { page, size } }
    );
    return data; // Page<BadgeResponseDTO>
  },

  /** Obtener badges con conteo de usuarios */
  listWithUserCount: async (): Promise<BadgeWithUserCountDTO[]> => {
    const { data } = await api.get(`/api/badges/with-user-count`);
    return data;
  },

  /** Conteo de usuarios por badge */
  getUserCountByBadge: async (id: number): Promise<number> => {
    const { data } = await api.get(`/api/badges/${id}/user-count`);
    return data; // number
  },

  /** Obtener insignias filtrando por dificultad (devuelve con conteo de usuarios) */
  getBadgesWithUserCountByDifficulty: async (
    difficulty: BadgesDifficulty
  ): Promise<BadgeWithUserCountDTO[]> => {
    const { data } = await api.get(
      `/api/badges/with-user-count?difficulty=${difficulty}`
    );
    return data;
  },
};
