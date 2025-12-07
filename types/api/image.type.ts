export interface ImageUploadResponseDto {
  /**
   * ID del archivo generado en storage_objects (para usar en submission_files)
   */
  fileId: number;

  /**
   * URL pública de la imagen subida
   */
  imageUrl: string;

  /**
   * Nombre del archivo original
   */
  originalFileName: string;

  /**
   * Tamaño del archivo en bytes
   */
  fileSize: number;

  /**
   * Tipo de contenido de la imagen
   */
  contentType: string;

  /**
   * Mensaje de éxito
   */
  message: string;
}
