import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ImageService } from '@/services/image.service';
import { ValidationType } from '@/types/api/submission.type';
import { Alert } from 'react-native';

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
}

interface UseFileUploadReturn {
  selectedFile: SelectedFile | null;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadFile: (file: SelectedFile, validationType: ValidationType) => Promise<any>;
  removeFile: () => void;
  clearFiles: () => void;
  clearError: () => void;
  pickPhotoFromGallery: (validationType: ValidationType) => Promise<void>;
  pickPdfDocument: (validationType: ValidationType) => Promise<void>;
}

/**
 * Custom hook para manejar la carga de archivos
 * Soporta fotos desde galería y PDFs desde documentos
 * Valida tipos de archivo según el tipo de validación del reto
 */
export const useFileUpload = (): UseFileUploadReturn => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida que el tipo de archivo coincida con el tipo de validación requerido
   */
  const validateFileType = (
    contentType: string,
    filename: string,
    validationType: ValidationType
  ): boolean => {
    if (validationType === 'PHOTO') {
      return contentType.startsWith('image/');
    } else if (validationType === 'PDF') {
      // Verificar por extensión del archivo también
      const ext = filename.toLowerCase().split('.').pop();
      return contentType === 'application/pdf' && ext === 'pdf';
    }
    return false;
  };

  /**
   * Sube un archivo a través del ImageService
   * Para PDFs usa uploadPdf, para imágenes usa upload
   * Retorna el fileId obtenido del servidor
   */
  const uploadFile = useCallback(
    async (file: SelectedFile, validationType: ValidationType): Promise<any> => {
      try {
        setUploading(true);
        setError(null);

        // Validar tipo de archivo
        const contentType = file.type || file.mimeType || 'application/octet-stream';
        
        if (!validateFileType(contentType, file.name, validationType)) {
          const expectedType = validationType === 'PHOTO' ? 'imagen' : 'PDF';
          throw new Error(
            `El archivo debe ser de tipo ${expectedType}. Se recibió: ${contentType}`
          );
        }

        console.log('');
        console.log('═══════════════════════════════════════════════');
        console.log('📤 useFileUpload.uploadFile - Iniciando carga');
        console.log('═══════════════════════════════════════════════');
        console.log('   - Nombre:', file.name);
        console.log('   - Tamaño:', file.size, 'bytes');
        console.log('   - Tipo MIME:', contentType);
        console.log('   - Validación:', validationType);
        console.log('═══════════════════════════════════════════════');

        // Simular progreso de carga
        setUploadProgress(30);

        // Subir archivo usando el endpoint correcto según el tipo
        let response;
        if (validationType === 'PDF') {
          // Usar endpoint específico para PDFs
          console.log('📤 Usando ImageService.uploadPdf()');
          response = await ImageService.uploadPdf(file);
        } else {
          // Usar endpoint para imágenes
          console.log('📤 Usando ImageService.upload()');
          response = await ImageService.upload(file);
        }

        setUploadProgress(100);

        console.log('');
        console.log('═══════════════════════════════════════════════');
        console.log('✅ Archivo subido exitosamente');
        console.log('═══════════════════════════════════════════════');
        console.log('   - Response completa:', JSON.stringify(response, null, 2));
        console.log('   - fileId:', response.fileId, '(type:', typeof response.fileId, ')');
        console.log('═══════════════════════════════════════════════');
        console.log('');

        // El servidor devuelve directamente fileId (número) en la respuesta
        if (!response.fileId && response.fileId !== 0) {
          throw new Error('El servidor no devolvió un identificador válido del archivo (fileId). Respuesta: ' + JSON.stringify(response));
        }

        // Asegurar que fileId es un número
        if (typeof response.fileId !== 'number') {
          console.warn('⚠️ fileId no es número, parseando:', response.fileId);
          response.fileId = parseInt(response.fileId, 10);
        }

        // Retornar la respuesta completa del servidor
        // fileId es un número devuelto por el endpoint upload/upload-pdf
        return response;
      } catch (err: any) {
        const errorMessage = err?.message || 'Error al subir el archivo';
        console.error('❌ Error en uploadFile:', errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    []
  );

  /**
   * Abre el selector de fotos de la galería
   */
  const pickPhotoFromGallery = useCallback(
    async (validationType: ValidationType) => {
      try {
        setError(null);

        // Validar que el tipo sea PHOTO
        if (validationType !== 'PHOTO') {
          throw new Error('Este reto requiere PDF, no fotos');
        }

        // Solicitar permisos
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          throw new Error('Permiso denegado para acceder a la galería');
        }

        // Abrir selector de imagen
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          
          // Inferir el tipo MIME correcto basado en la extensión del archivo
          const filename = asset.fileName || `photo_${Date.now()}.jpg`;
          const ext = filename.toLowerCase().split('.').pop();
          
          const mimeTypeMap: { [key: string]: string } = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
          };
          
          const mimeType = mimeTypeMap[ext || 'jpg'] || 'image/jpeg';
          
          const file: SelectedFile = {
            uri: asset.uri,
            type: mimeType,
            name: filename,
            mimeType: mimeType,
            size: asset.fileSize || 0,
          };

          setSelectedFile(file);
        }
      } catch (err: any) {
        const errorMessage = err?.message || 'Error al seleccionar foto';
        setError(errorMessage);
      }
    },
    [uploadFile]
  );

  /**
   * Abre el selector de documentos PDFs
   */
  const pickPdfDocument = useCallback(
    async (validationType: ValidationType) => {
      try {
        setError(null);

        // Validar que el tipo sea PDF
        if (validationType !== 'PDF') {
          throw new Error('Este reto requiere fotos, no PDFs');
        }

        // Abrir selector de documento
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
        });

        if (result && 'assets' in result && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          const file: SelectedFile = {
            uri: asset.uri,
            type: 'application/pdf',
            name: asset.name,
            mimeType: 'application/pdf',
            size: asset.size || 0,
          };

          setSelectedFile(file);
        }
      } catch (err: any) {
        const errorMessage = err?.message || 'Error al seleccionar PDF';
        setError(errorMessage);
      }
    },
    [uploadFile]
  );

  /**
   * Elimina el archivo seleccionado
   */
  const removeFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  /**
   * Limpia el archivo seleccionado
   */
  const clearFiles = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    selectedFile,
    uploading,
    uploadProgress,
    error,
    uploadFile,
    removeFile,
    clearFiles,
    clearError,
    pickPhotoFromGallery,
    pickPdfDocument,
  };
};
