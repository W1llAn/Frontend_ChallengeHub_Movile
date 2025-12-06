export interface ImageResponseDTO {
  fileName: string;
  imageUrl: string;
  contentType: string;
  fileSize: number;
  message: string;
}

export interface ImageUploadResponseDto {
  fileId: number; 
  imageUrl: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  message: string;
  objectKey?: string; 
}
