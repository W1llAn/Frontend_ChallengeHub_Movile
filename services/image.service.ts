import api from "../api/api";
import { ImageUploadResponseDto } from "../types/api/image.type";

export const ImageService = {
  /**
   * Sube una imagen al servidor
   * @param file - Archivo de imagen a subir (JPG, JPEG, PNG, GIF, WEBP)
   * @returns Promesa con la respuesta de la subida (incluye fileId de la BD)
   * @throws Error si el archivo no es válido, está vacío o excede el tamaño máximo
   * 
   * IMPORTANTE: Retorna fileId que debe usarse en SubmissionService.addFile()
   */
  upload: async (file: any): Promise<ImageUploadResponseDto> => {
    // Validar que el archivo sea una imagen válida
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const fileType = file.type || file.mimeType || '';
    
    if (!validImageTypes.includes(fileType)) {
      throw new Error(
        `El archivo debe ser una imagen válida (JPG, PNG, GIF, WEBP). Se recibió: ${fileType}`
      );
    }

    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      throw new Error("El archivo de imagen está vacío. Selecciona un archivo válido.");
    }

    // Validar que no exceda el tamaño máximo (10MB para imágenes)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      throw new Error(
        `El archivo de imagen es demasiado grande. Tamaño máximo permitido: 10MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      );
    }

    console.log('🔧 ImageService.upload - Archivo:', file.name || file.filename);
    console.log('   - Tamaño:', file.size, 'bytes');
    console.log('   - Tipo MIME:', fileType);
    
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post(`/images/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log('✅ Imagen subida - Response completa:', JSON.stringify(data, null, 2));
    console.log('   - fileId:', data.fileId, '(type:', typeof data.fileId, ')');
    console.log('   - imageUrl:', data.imageUrl);
    
    // Validar que fileId sea un número válido
    if (typeof data.fileId !== 'number') {
      console.warn('⚠️ ADVERTENCIA: fileId no es un número, intentando parsear:', data.fileId);
      if (typeof data.fileId === 'string') {
        data.fileId = parseInt(data.fileId, 10);
      }
    }
    
    if (!data.fileId && data.fileId !== 0) {
      throw new Error('El servidor no devolvió un fileId válido. Respuesta: ' + JSON.stringify(data));
    }
    
    return data;
  },

  /**
   * Sube un archivo PDF al bucket del servidor
   * @param file - Archivo PDF a subir
   * @returns Promesa con la respuesta de la subida del PDF (incluye fileId de la BD)
   * @throws Error si el archivo no es PDF, está vacío o excede el tamaño máximo (50MB)
   * 
   * IMPORTANTE: Retorna fileId que debe usarse en SubmissionService.addFile()
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

    console.log('🔧 ImageService.uploadPdf - Archivo:', file.name || file.filename);
    console.log('   - Tamaño:', file.size, 'bytes');
    console.log('   - Tipo MIME:', file.type);
    
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post(`/images/upload-pdf`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log('✅ PDF subido - Response completa:', JSON.stringify(data, null, 2));
    console.log('   - fileId:', data.fileId, '(type:', typeof data.fileId, ')');
    console.log('   - imageUrl:', data.imageUrl);
    
    // Validar que fileId sea un número válido
    if (typeof data.fileId !== 'number') {
      console.warn('⚠️ ADVERTENCIA: fileId no es un número, intentando parsear:', data.fileId);
      if (typeof data.fileId === 'string') {
        data.fileId = parseInt(data.fileId, 10);
      }
    }
    
    if (!data.fileId && data.fileId !== 0) {
      throw new Error('El servidor no devolvió un fileId válido. Respuesta: ' + JSON.stringify(data));
    }
    
    return data;
  },
};
