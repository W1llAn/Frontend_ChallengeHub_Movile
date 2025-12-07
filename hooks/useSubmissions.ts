import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SubmissionService } from '@/services/submission.service';
import {
  SubmissionCreateDTO,
  SubmissionFileCreateDTO,
  SubmissionUpdateDTO,
  SubmissionFileResponseDTO,
  SubmissionResponseDTO,
  ValidationType,
  UserChallengePointsDTO,
  UserTotalPointsDTO,
} from '@/types/api/submission.type';
import { Alert } from 'react-native';

interface UseSubmissionsReturn {
  submissions: SubmissionResponseDTO[];
  loading: boolean;
  creating: boolean;
  addingFile: boolean;
  updating: boolean;
  deleting: boolean;
  loadingPoints: boolean;
  error: string | null;
  createSubmission: (payload: SubmissionCreateDTO) => Promise<SubmissionResponseDTO>;
  addFileToSubmission: (submissionId: number, payload: SubmissionFileCreateDTO) => Promise<SubmissionFileResponseDTO>;
  updateSubmission: (submissionId: number, payload: SubmissionUpdateDTO) => Promise<SubmissionResponseDTO>;
  loadSubmissionsByUserChallenge: (userChallengeId: number) => Promise<void>;
  deleteSubmission: (submissionId: number) => Promise<void>;
  getPointsByUserAndChallenge: (userId: number, challengeId: number) => Promise<UserChallengePointsDTO>;
  getTotalPointsByUser: (userId: number) => Promise<UserTotalPointsDTO>;
  clearError: () => void;
}

/**
 * Custom hook para manejar la lógica completa de submissions
 * Implementa: crear, agregar archivo, editar y eliminar
 */
export const useSubmissions = (): UseSubmissionsReturn => {
  const { completeUser } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addingFile, setAddingFile] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * PASO 1: Crea un nuevo submission (registro de avance)
   * @param payload Datos del submission (userChallengeId, type)
   * El periodKey (fecha) se genera automáticamente en el servidor
   * 
   * IMPORTANTE: Después de crear el submission, debe llamar a addFileToSubmission()
   * para asociar el archivo previamente subido
   */
  const createSubmission = useCallback(
    async (payload: SubmissionCreateDTO): Promise<SubmissionResponseDTO> => {
      if (!completeUser?.id) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setCreating(true);
        setError(null);

        // Validación básica del payload
        if (!payload.userChallengeId || !payload.type) {
          throw new Error('Datos incompletos: userChallengeId y type son requeridos');
        }

        console.log('📋 ANTES DE createSubmission - Payload a enviar:');
        console.log(JSON.stringify(payload, null, 2));

        const response = await SubmissionService.create(payload);
        
        console.log('📥 RESPUESTA DE createSubmission:');
        console.log(JSON.stringify(response, null, 2));
        console.log('   - response.id:', response.id, '(type:', typeof response.id, ')');
        
        console.log('✅ Submission creado con ID:', response.id);
        // El submission se agrega a la lista
        setSubmissions(prev => [response, ...prev]);
        
        return response;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Error al crear el submission';
        setError(errorMessage);
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [completeUser?.id]
  );

  /**
   * PASO 2: Asocia un archivo a un submission creado
   * @param submissionId ID del submission creado en el paso 1
   * @param payload Datos del archivo (fileId obtenido de ImageService.uploadPdf, role)
   * 
   * Después de este paso, el submission queda completo y:
   * - Si requireReview=true: queda en estado PENDING (requiere revisión manual)
   * - Si requireReview=false: se auto-aprueba inmediatamente
   */
  const addFileToSubmission = useCallback(
    async (submissionId: number, payload: SubmissionFileCreateDTO): Promise<SubmissionFileResponseDTO> => {
      if (!completeUser?.id) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setAddingFile(true);
        setError(null);

        console.log('🔍 useSubmissions.addFileToSubmission - Validando...');
        console.log('   submissionId:', submissionId, '(type:', typeof submissionId, ', valid:', !!submissionId, ')');
        console.log('   fileId:', payload.fileId, '(type:', typeof payload.fileId, ', valid:', !!payload.fileId, ')');
        console.log('   role:', payload.role, '(type:', typeof payload.role, ', valid:', !!payload.role, ')');

        if (!submissionId || !payload.fileId || !payload.role) {
          throw new Error('Datos incompletos: submissionId, fileId y role son requeridos');
        }

        console.log('✅ Validación pasada, llamando al servicio...');
        const response = await SubmissionService.addFile(submissionId, payload);
        
        console.log('✅ Archivo agregado al submission');
        // Actualizar el submission en la lista
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, files: [...(sub.files || []), response] }
            : sub
        ));
        
        return response;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Error al agregar el archivo';
        console.error('❌ Error en addFileToSubmission:', errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setAddingFile(false);
      }
    },
    [completeUser?.id]
  );

  /**
   * Editar submission completo
   * Solo disponible si el submission está en estado PENDING
   * Permite cambiar el tipo de validación y/o reemplazar el archivo
   */
  const updateSubmission = useCallback(
    async (submissionId: number, payload: SubmissionUpdateDTO): Promise<SubmissionResponseDTO> => {
      if (!completeUser?.id) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setUpdating(true);
        setError(null);

        if (!submissionId || !payload.type) {
          throw new Error('Datos incompletos: submissionId y type son requeridos');
        }

        const response = await SubmissionService.update(submissionId, payload);
        
        console.log('✅ Submission actualizado');
        // Actualizar el submission en la lista
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId ? response : sub
        ));
        
        return response;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Error al actualizar el submission';
        setError(errorMessage);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [completeUser?.id]
  );

  /**
   * Carga todos los submissions de un UserChallenge específico
   * @param userChallengeId ID del reto del usuario
   */
  const loadSubmissionsByUserChallenge = useCallback(
    async (userChallengeId: number) => {
      if (!userChallengeId) {
        console.warn('⚠️ loadSubmissionsByUserChallenge - userChallengeId es nulo/vacío');
        setSubmissions([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('');
        console.log('═══════════════════════════════════════════════');
        console.log('📤 useSubmissions.loadSubmissionsByUserChallenge');
        console.log('═══════════════════════════════════════════════');
        console.log('   - userChallengeId:', userChallengeId);
        
        const data = await SubmissionService.listByUserChallenge(userChallengeId);
        
        console.log('✅ Submissions cargados exitosamente');
        console.log('   - Total:', data.length);
        console.log('   - Datos:', JSON.stringify(data, null, 2));
        console.log('═══════════════════════════════════════════════');
        console.log('');
        
        setSubmissions(data);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Error al cargar los submissions';
        console.error('❌ Error en loadSubmissionsByUserChallenge:', errorMessage);
        setError(errorMessage);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Elimina un submission completo
   * Solo disponible si el submission está en estado PENDING
   * Elimina todos los archivos asociados del bucket
   * @param submissionId ID del submission a eliminar
   */
  const deleteSubmission = useCallback(
    async (submissionId: number): Promise<void> => {
      try {
        setDeleting(true);
        setError(null);
        
        await SubmissionService.deleteSubmission(submissionId);
        
        // Remover el submission de la lista local
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        
        console.log('✅ Submission eliminado completamente');
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Error al eliminar el submission';
        setError(errorMessage);
        throw err;
      } finally {
        setDeleting(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Obtener puntos de un usuario en un reto específico
   * @param userId ID del usuario
   * @param challengeId ID del reto
   * @returns Puntos del usuario en ese reto
   */
  const getPointsByUserAndChallenge = useCallback(
    async (userId: number, challengeId: number): Promise<UserChallengePointsDTO> => {
      try {
        setLoadingPoints(true);
        setError(null);
        const data = await SubmissionService.getPointsByUserAndChallenge(userId, challengeId);
        return data;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Error al obtener los puntos';
        setError(errorMessage);
        throw err;
      } finally {
        setLoadingPoints(false);
      }
    },
    []
  );

  /**
   * Obtener todos los puntos de un usuario
   * @param userId ID del usuario
   * @returns Puntos totales y desglose por reto
   */
  const getTotalPointsByUser = useCallback(
    async (userId: number): Promise<UserTotalPointsDTO> => {
      try {
        setLoadingPoints(true);
        setError(null);
        const data = await SubmissionService.getTotalPointsByUser(userId);
        return data;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Error al obtener los puntos totales';
        setError(errorMessage);
        throw err;
      } finally {
        setLoadingPoints(false);
      }
    },
    []
  );

  return {
    submissions,
    loading,
    creating,
    addingFile,
    updating,
    deleting,
    loadingPoints,
    error,
    createSubmission,
    addFileToSubmission,
    updateSubmission,
    loadSubmissionsByUserChallenge,
    deleteSubmission,
    getPointsByUserAndChallenge,
    getTotalPointsByUser,
    clearError,
  };
};
