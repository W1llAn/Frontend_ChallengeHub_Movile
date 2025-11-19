/**
 * useUsers Hook
 * Custom hook para manejar toda la lógica relacionada con usuarios
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserById, updateUserById } from "@/services/user.service";
import { showNotifier } from "@/services/notifier";
import type {
  UserResponseDTO,
  UserItselfUpdateDTO,
} from "@/types/api/user.type";

export interface UseUsersReturn {
  // Estado
  currentUser: UserResponseDTO | null;
  loading: boolean;
  updating: boolean;
  error: string | null;

  // Métodos
  fetchCurrentUser: (userId: number) => Promise<void>;
  updateCurrentUser: (dto: UserItselfUpdateDTO) => Promise<boolean>;
  refreshCurrentUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook para manejar la lógica de usuarios
 * Obtiene automáticamente el usuario completo de Auth0 y backend
 * @returns Objeto con estado y métodos para manejar usuarios
 */
export const useUsers = (): UseUsersReturn => {
  const { completeUser, user: authUser, authError } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== NUEVA LÓGICA: Sincronizar usuario completo del contexto =====
  useEffect(() => {
    if (completeUser) {
      setCurrentUser(completeUser);
      setError(null); // Limpiar error cuando se carga exitosamente
      console.log("✅ Usuario sincronizado desde AuthContext:", completeUser);
    } else if (authError) {
      setError(authError);
      console.error("❌ Error en AuthContext:", authError);
    }
  }, [completeUser, authError]);

  /**
   * Obtiene el usuario actual por ID
   * Útil para refrescar datos después de una actualización
   */
  const fetchCurrentUser = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getUserById(userId);

      if (userData) {
        setCurrentUser(userData);
      } else {
        setError("No se pudo cargar el perfil del usuario");
        showNotifier("Error al cargar el perfil", "error");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza el usuario actual
   */
  const updateCurrentUser = async (
    dto: UserItselfUpdateDTO
  ): Promise<boolean> => {
    if (!currentUser) {
      showNotifier("No hay usuario para actualizar", "error");
      return false;
    }

    try {
      setUpdating(true);
      setError(null);
      const success = await updateUserById(currentUser.id, dto);

      if (success) {
        // Actualizar el estado local con los nuevos datos
        setCurrentUser({
          ...currentUser,
          ...dto,
          // No actualizamos el ID, email ni otros campos que no son actualizables
        });
        showNotifier("Perfil actualizado correctamente", "success");
        return true;
      } else {
        setError("No se pudo actualizar el perfil");
        showNotifier("Error al actualizar el perfil", "error");
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMsg);
      showNotifier(errorMsg, "error");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Recarga el usuario actual desde el servidor
   */
  const refreshCurrentUser = async () => {
    if (currentUser) {
      await fetchCurrentUser(currentUser.id);
    }
  };

  /**
   * Limpia el error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    currentUser,
    loading,
    updating,
    error,
    fetchCurrentUser,
    updateCurrentUser,
    refreshCurrentUser,
    clearError,
  };
};
