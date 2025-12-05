import api from "../api/api";
import { ImageUploadResponseDto } from "../types/api/image.type";

export const ImageService = {
  upload: async (file: any): Promise<ImageUploadResponseDto> => {
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post(`/api/images/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },
};
