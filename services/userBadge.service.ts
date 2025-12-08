import api from "../api/api";
import {
  CreateUserBadgeDTO,
  UserBadgeResponseDTO,
  UserBadgesSummaryDTO,
} from "../types/api/userBadge.type";

export const UserBadgeService = {
  listPaged: async (page = 0, size = 10) => {
    const { data } = await api.get(`/user-badges`, { params: { page, size } });
    return data; // Page<UserBadgeResponseDTO>
  },

  getById: async (id: number): Promise<UserBadgeResponseDTO> => {
    const { data } = await api.get(`/user-badges/${id}`);
    return data;
  },

  assign: async (payload: CreateUserBadgeDTO): Promise<UserBadgeResponseDTO> => {
    const { data } = await api.post(`/user-badges`, payload);
    return data;
  },

  remove: async (userBadgeId: number): Promise<void> => {
    await api.delete(`/user-badges/${userBadgeId}`);
  },

  listByUser: async (userId: number, page = 0, size = 10) => {
    const { data } = await api.get(`/user-badges/user/${userId}`, {
      params: { page, size },
    });
    return data; // Page<UserBadgeResponseDTO>
  },

  getUserSummary: async (userId: number): Promise<UserBadgesSummaryDTO> => {
    const { data } = await api.get(`/user-badges/user/${userId}/summary`);
    return data;
  },

  listUsersByBadge: async (badgeId: number, page = 0, size = 10) => {
    const { data } = await api.get(`/user-badges/badge/${badgeId}`, {
      params: { page, size },
    });
    return data; // Page<UserBadgeResponseDTO>
  },

  /** Obtener usuarios que tienen una insignia específica */
  getUsersByBadge: async (badgeId: number, page = 0, size = 10) => {
    const { data } = await api.get(`/user-badges/badge/${badgeId}`, {
      params: { page, size },
    });
    return data; // Page<UserBadgeResponseDTO>
  },
};
