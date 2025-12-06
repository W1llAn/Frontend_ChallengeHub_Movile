export interface ImageResponseDTO {
  fileName: string;
  imageUrl: string;
  contentType: string;
  fileSize: number;
  message: string;
}

export interface ImageUploadResponseDto {
  imageUrl: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  message: string;
  fileId?: string; // ID del archivo en storage (usado para referencias en submissions)
  objectKey?: string; // Clave del objeto en MinIO/bucket
}
