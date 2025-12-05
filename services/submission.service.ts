import api from "../api/api";
import {
  SubmissionCreateDTO,
  SubmissionReviewDTO,
  SubmissionResponseDTO,
} from "../types/api/submission.type";

export const SubmissionService = {
  create: async (
    payload: SubmissionCreateDTO
  ): Promise<SubmissionResponseDTO> => {
    const { data } = await api.post(`/api/submissions`, payload);
    return data;
  },

  review: async (
    submissionId: number,
    payload: SubmissionReviewDTO,
    reviewerId: number
  ) => {
    const { data } = await api.patch(
      `/api/submissions/${submissionId}/review`,
      payload,
      { params: { reviewerId } }
    );
    return data;
  },

  listByUserChallenge: async (userChallengeId: number) => {
    const { data } = await api.get(
      `/api/submissions/by-user-challenge/${userChallengeId}`
    );
    return data;
  },

  listPending: async () => {
    const { data } = await api.get(`/api/submissions/pending`);
    return data;
  },

  listPdfUrlsByUserChallenge: async (userChallengeId: number) => {
    const { data } = await api.get(
      `/api/submissions/by-user-challenge/${userChallengeId}/pdf-urls`
    );
    return data;
  },

  listPdfUrlsBySubmission: async (submissionId: number) => {
    const { data } = await api.get(
      `/api/submissions/${submissionId}/pdf-urls`
    );
    return data;
  },

  getSinglePdf: async (submissionId: number) => {
    const { data } = await api.get(
      `/api/submissions/${submissionId}/pdf-url`
    );
    return data.url;
  },
};
