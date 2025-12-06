import api from "../api/api";
import { ImageUploadResponseDto } from "../types/api/image.type";

export const ImageService = {
  /**
   * Sube una imagen al servidor
   * @param file - Archivo de imagen a subir (JPG, JPEG, PNG, GIF, WEBP)
   * @returns Promesa con la respuesta de la subida de la imagen
   */
  upload: async (file: any): Promise<ImageUploadResponseDto> => {
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post(`/api/images/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  /**
   * Sube un archivo PDF al bucket del servidor
   * @param file - Archivo PDF a subir
   * @returns Promesa con la respuesta de la subida del PDF (incluye fileId y objectKey)
   * @throws Error si el archivo no es PDF, está vacío o excede el tamaño máximo (50MB)
   */
  uploadPdf: async (file: any): Promise<ImageUploadResponseDto> => {
    // Validar que el archivo sea un PDF
    if (!file || file.type !== "application/pdf") {
      throw new Error(
        "El archivo debe ser un PDF válido. Por favor, selecciona un archivo PDF."
      );
    }

    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      throw new Error("El archivo PDF está vacío. Selecciona un archivo válido.");
    }

    // Validar que no exceda el tamaño máximo (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB en bytes
    if (file.size > maxSize) {
      throw new Error(
        `El archivo PDF es demasiado grande. Tamaño máximo permitido: 50MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      );
    }

    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post(`/api/images/upload-pdf`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },
};
