// services/user.service.ts
import { api } from "../api/api";
import type {
  UserResponseDTO,
  UserItselfUpdateDTO,
  UserAdminUpdateDTO,
} from "../types/api/user.type";

/** GET /api/users */
export const getAllUsers = async (): Promise<UserResponseDTO[]> => {
  try {
    const { data } = await api.get<UserResponseDTO[]>("/users");
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

/** GET /api/users/{id} */
export const getUserById = async (
  id: number
): Promise<UserResponseDTO | null> => {
  try {
    const { data } = await api.get<UserResponseDTO>(`/users/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }
};

/** PUT /api/users/{id} → 204 No Content */
export const updateUserById = async (
  id: number,
  dto: UserItselfUpdateDTO
): Promise<boolean> => {
  try {
    await api.put(`/users/${id}`, dto);
    return true;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    return false;
  }
};

/** PATCH /api/users/{id} → 204 No Content */
export const adminUpdateUser = async (
  id: number,
  dto: UserAdminUpdateDTO
): Promise<boolean> => {
  try {
    await api.patch(`/users/${id}`, dto);
    return true;
  } catch (error) {
    console.error(`Error admin-updating user with id ${id}:`, error);
    return false;
  }
};

/** GET /api/users/search/email?email=... */
export const findUserByEmail = async (
  email: string
): Promise<UserResponseDTO | null> => {
  try {
    const { data } = await api.get<UserResponseDTO>("/users/search/email", {
      params: { email },
    });
    return data;
  } catch (error) {
    console.error(`Error searching user by email "${email}":`, error);
    return null;
  }
};

/** GET /api/users/search/username?username=... */
export const findUserByUsername = async (
  username: string
): Promise<UserResponseDTO | null> => {
  try {
    const { data } = await api.get<UserResponseDTO>("/users/search/username", {
      params: { username },
    });
    return data;
  } catch (error) {
    console.error(`Error searching user by username "${username}":`, error);
    return null;
  }
};

/** GET /api/users/creator/{username} */
export const findCreatorByUsername = async (
  username: string
): Promise<UserResponseDTO | null> => {
  try {
    const { data } = await api.get<UserResponseDTO[]>(`/users/creator/${username}`);
    // El endpoint devuelve una lista, tomamos el primer resultado
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error searching creator by username "${username}":`, error);
    return null;
  }
};
