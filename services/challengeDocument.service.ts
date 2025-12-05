import api from "../api/api";
import {
  PdfUploadResponseDto,
  ChallengeDocumentCreateDTO,
  ChallengeDocumentResponseDTO,
} from "../types/api/file.type";

export const ChallengeDocumentService = {
  uploadPdf: async (
    challengeId: number,
    file: any,
    title?: string,
    notes?: string
  ): Promise<PdfUploadResponseDto> => {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    if (notes) form.append("notes", notes);

    const { data } = await api.post(
      `/api/challenges/${challengeId}/documents/upload-pdf`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  create: async (
    challengeId: number,
    payload: ChallengeDocumentCreateDTO
  ): Promise<ChallengeDocumentResponseDTO> => {
    const { data } = await api.post(
      `/api/challenges/${challengeId}/documents`,
      payload
    );
    return data;
  },

  activate: async (challengeId: number, documentId: number) => {
    const { data } = await api.patch(
      `/api/challenges/${challengeId}/documents/activate`,
      null,
      { params: { documentId } }
    );
    return data;
  },

  list: async (challengeId: number) => {
    const { data } = await api.get(`/api/challenges/${challengeId}/documents`);
    return data; // ChallengeDocumentResponseDTO[]
  },

  getActive: async (challengeId: number) => {
    const { data } = await api.get(`/api/challenges/${challengeId}/documents/active`);
    return data;
  },

  getActiveUrl: async (challengeId: number): Promise<string> => {
    const { data } = await api.get(
      `/api/challenges/${challengeId}/documents/active-url`
    );
    return data.url;
  },

  listAllUrls: async (challengeId: number): Promise<string[]> => {
    const { data } = await api.get(
      `/api/challenges/${challengeId}/documents/urls`
    );
    return data;
  },

  getUrlByDocumentId: async (
    challengeId: number,
    documentId: number
  ): Promise<string> => {
    const { data } = await api.get(
      `/api/challenges/${challengeId}/documents/${documentId}/url`
    );
    return data.url;
  },

  deleteById: async (
    challengeId: number,
    documentId: number,
    requesterId: number
  ) => {
    await api.delete(
      `/api/challenges/${challengeId}/documents/${documentId}`,
      { params: { requesterId } }
    );
  },

  deleteAll: async (challengeId: number) => {
    await api.delete(`/api/challenges/${challengeId}/documents`);
  },
};
