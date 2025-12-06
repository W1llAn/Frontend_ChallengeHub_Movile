import api from "../api/api";
import {
  SubmissionCreateDTO,
  SubmissionReviewDTO,
  SubmissionResponseDTO,
} from "../types/api/submission.type";

export const SubmissionService = {
  /**
   * Crear envío de avance
   * FLUJO CORRECTO:
   * 1. Usuario sube PDF/imagen con ImageService.uploadPdf() o ImageService.upload()
   * 2. Recibe fileId en la respuesta
   * 3. Llama a este endpoint pasando el fileId
   * El periodKey (fecha de envío) se genera automáticamente como la fecha actual
   * Si el reto requiere revisión manual (requireReview=true), queda PENDING
   * Si no requiere revisión, se auto-aprueba inmediatamente y se asignan puntos
   */
  create: async (
    payload: SubmissionCreateDTO
  ): Promise<SubmissionResponseDTO> => {
    const { data } = await api.post(`/api/submissions`, payload);
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
      `/api/submissions/${submissionId}/review`,
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
      `/api/submissions/by-user-challenge/${userChallengeId}`
    );
    return data;
  },

  /**
   * Listar envíos pendientes
   * Devuelve todos los envíos con estado PENDING (cola de revisión), ordenados por fecha de creación ascendente
   */
  listPending: async () => {
    const { data } = await api.get(`/api/submissions/pending`);
    return data;
  },

  /**
   * URLs de PDFs por suscripción (user_challenge)
   * Devuelve todas las URLs de PDFs subidos como evidencias para una suscripción específica
   */
  listPdfUrlsByUserChallenge: async (userChallengeId: number) => {
    const { data } = await api.get(
      `/api/submissions/by-user-challenge/${userChallengeId}/pdf-urls`
    );
    return data;
  },

  /**
   * URLs de PDFs por submission
   * Devuelve todas las URLs de PDFs adjuntos a una submission concreta
   */
  listPdfUrlsBySubmission: async (submissionId: number) => {
    const { data } = await api.get(
      `/api/submissions/${submissionId}/pdf-urls`
    );
    return data;
  },

  /**
   * URL de un único PDF de submission
   * Devuelve la URL del primer PDF encontrado dentro de los archivos de la submission
   */
  getSinglePdf: async (submissionId: number): Promise<string> => {
    const { data } = await api.get(
      `/api/submissions/${submissionId}/pdf-url`
    );
    return data.url;
  },

  /**
   * Eliminar envío
   * Solo el usuario que envió (o el creador del reto) puede eliminar
   * Solo puede eliminarse si es el último envío
   */
  delete: async (submissionId: number): Promise<void> => {
    await api.delete(`/api/submissions/${submissionId}`);
  },
};
