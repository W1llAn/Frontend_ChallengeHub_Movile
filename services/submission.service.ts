import api from "../api/api";
import {
  SubmissionCreateDTO,
  SubmissionFileCreateDTO,
  SubmissionUpdateDTO,
  SubmissionFileResponseDTO,
  SubmissionReviewDTO,
  SubmissionResponseDTO,
  UserChallengePointsDTO,
  UserTotalPointsDTO,
} from "../types/api/submission.type";

export const SubmissionService = {
  /**
   * PASO 1: Crear submission (envío de avance)
   * 
   * FLUJO CORRECTO:
   * 1. Usuario sube PDF/imagen con ImageService.uploadPdf() o ImageService.upload()
   * 2. Recibe fileId en la respuesta
   * 3. Llama a create() con userChallengeId y type
   * 4. Luego llama a addFile() con el submissionId y fileId del paso 1
   * 
   * El periodKey (fecha de envío) se genera automáticamente como la fecha actual
   * Si el reto requiere revisión manual (requireReview=true), queda PENDING
   * Si no requiere revisión, se auto-aprueba inmediatamente y se asignan puntos
   */
  create: async (
    payload: SubmissionCreateDTO
  ): Promise<SubmissionResponseDTO> => {
    console.log('🔧 SubmissionService.create - Payload:', payload);
    const { data } = await api.post(`/submissions`, payload);
    console.log('✅ Submission creada:', data);
    return data;
  },

  /**
   * PASO 2: Asociar archivo a submission
   * 
   * Después de crear la submission en el paso 1, se debe asociar el archivo
   * subido previamente con ImageService.uploadPdf() o ImageService.upload()
   * 
   * Respuesta: Objeto SubmissionFile con todos los datos del archivo incluida su URL
   * Nota: Esto activa notificaciones y recalcula progreso si es auto-aprobado
   */
  addFile: async (
    submissionId: number,
    payload: SubmissionFileCreateDTO
  ): Promise<SubmissionFileResponseDTO> => {
    console.log('🔧 SubmissionService.addFile');
    console.log('   submissionId:', submissionId, '(type:', typeof submissionId, ')');
    console.log('   payload:', JSON.stringify(payload, null, 2));
    console.log('   URL destino: POST /submissions/' + submissionId + '/files');
    
    const { data } = await api.post(
      `/submissions/${submissionId}/files`,
      payload
    );
    console.log('✅ Archivo asociado a submission:', JSON.stringify(data, null, 2));
    return data;
  },

  /**
   * Revisar envío (aprobar/rechazar)
   * El revisor (creador del reto) aprueba o rechaza el envío y puede asignar puntos
   * Al aprobar, se recalculan progreso y puntos del usuario en el reto
   */
  review: async (
    submissionId: number,
    payload: SubmissionReviewDTO,
    reviewerId: number
  ): Promise<SubmissionResponseDTO> => {
    const { data } = await api.patch(
      `/submissions/${submissionId}/review`,
      payload,
      { params: { reviewerId } }
    );
    return data;
  },

  /**
   * Listar envíos por suscripción (user_challenge)
   * Devuelve el historial de envíos de un usuario en un reto, ordenado por período descendente
   */
  listByUserChallenge: async (userChallengeId: number) => {
    const { data } = await api.get(
      `/submissions/by-user-challenge/${userChallengeId}`
    );
    return data;
  },

  /**
   * Listar envíos pendientes
   * Devuelve todos los envíos con estado PENDING (cola de revisión), ordenados por fecha de creación ascendente
   */
  listPending: async () => {
    const { data } = await api.get(`/submissions/pending`);
    return data;
  },

  /**
   * URLs de PDFs por suscripción (user_challenge)
   * Devuelve todas las URLs de PDFs subidos como evidencias para una suscripción específica
   */
  listPdfUrlsByUserChallenge: async (userChallengeId: number) => {
    const { data } = await api.get(
      `/submissions/by-user-challenge/${userChallengeId}/pdf-urls`
    );
    return data;
  },

  /**
   * URLs de PDFs por submission
   * Devuelve todas las URLs de PDFs adjuntos a una submission concreta
   */
  listPdfUrlsBySubmission: async (submissionId: number) => {
    const { data } = await api.get(
      `/submissions/${submissionId}/pdf-urls`
    );
    return data;
  },

  /**
   * URL de un único PDF de submission
   * Devuelve la URL del primer PDF encontrado dentro de los archivos de la submission
   */
  getSinglePdf: async (submissionId: number): Promise<string> => {
    const { data } = await api.get(
      `/submissions/${submissionId}/pdf-url`
    );
    return data.url;
  },

  /**
   * Editar submission completo
   * Solo disponible si el submission está en estado PENDING
   * Permite cambiar el tipo de validación y/o reemplazar el archivo
   * 
   * @param submissionId ID del submission a editar
   * @param payload Tipo de validación y opcionalmente nuevo fileId
   * @returns Datos del submission actualizado
   * 
   * El archivo anterior se elimina automáticamente si se proporciona un nuevo fileId
   */
  update: async (
    submissionId: number,
    payload: SubmissionUpdateDTO
  ): Promise<SubmissionResponseDTO> => {
    console.log(
      `🔧 SubmissionService.update - submissionId: ${submissionId}`,
      payload
    );
    const { data } = await api.put(
      `/submissions/${submissionId}`,
      payload
    );
    console.log("✅ Submission actualizado:", data);
    return data;
  },

  /**
   * Eliminar submission completo
   * Solo disponible si el submission está en estado PENDING
   * Elimina todos los archivos asociados del bucket
   * 
   * @param submissionId ID del submission a eliminar
   */
  deleteSubmission: async (submissionId: number): Promise<void> => {
    console.log(`🔧 SubmissionService.deleteSubmission - submissionId: ${submissionId}`);
    await api.delete(`/submissions/${submissionId}`);
    console.log("✅ Submission eliminado completamente");
  },

  /**
   * @deprecated Usar update() en su lugar
   */
  updateFile: async (
    submissionId: number,
    submissionFileId: number,
    payload: SubmissionUpdateDTO
  ): Promise<SubmissionFileResponseDTO> => {
    console.log(
      `🔧 SubmissionService.updateFile - submissionId: ${submissionId}, fileId: ${submissionFileId}`,
      payload
    );
    const { data } = await api.patch(
      `/submissions/${submissionId}/files/${submissionFileId}`,
      payload
    );
    console.log("✅ Archivo actualizado:", data);
    return data;
  },

  /**
   * @deprecated Usar deleteSubmission() en su lugar
   */
  deleteFile: async (
    submissionId: number,
    submissionFileId: number
  ): Promise<void> => {
    console.log(
      `🔧 SubmissionService.deleteFile - submissionId: ${submissionId}, fileId: ${submissionFileId}`
    );
    await api.delete(`/submissions/${submissionId}/files/${submissionFileId}`);
    console.log("✅ Archivo eliminado");
  },

  /**
   * @deprecated Usar deleteSubmission() en su lugar
   */
  delete: async (submissionId: number): Promise<void> => {
    await api.delete(`/submissions/${submissionId}`);
  },

  /**
   * Obtener puntos de un usuario en un reto específico
   * Retorna los puntos totales acumulados, número de avances aprobados y porcentaje de progreso
   * 
   * @param userId ID del usuario
   * @param challengeId ID del reto
   * @returns Puntos del usuario en ese reto específico
   */
  getPointsByUserAndChallenge: async (
    userId: number,
    challengeId: number
  ): Promise<UserChallengePointsDTO> => {
    const { data } = await api.get(
      `/submissions/points/user/${userId}/challenge/${challengeId}`
    );
    return data;
  },

  /**
   * Obtener todos los puntos de un usuario en todos sus retos
   * Retorna desglosados los puntos por cada reto en el que está suscrito
   * 
   * @param userId ID del usuario
   * @returns Puntos totales y desglose por reto
   */
  getTotalPointsByUser: async (userId: number): Promise<UserTotalPointsDTO> => {
    const { data } = await api.get(
      `/submissions/points/user/${userId}`
    );
    return data;
  },
};
