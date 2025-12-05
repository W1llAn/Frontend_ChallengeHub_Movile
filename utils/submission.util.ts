/**
 * Submissionsutilities
 * Funciones auxiliares y utilidades para manejo de submissions
 */

import { ValidationType } from '@/types/api/submission.type';

/**
 * Valida que un archivo sea del tipo correcto
 * @param contentType MIME type del archivo
 * @param validationType Tipo esperado (PHOTO | PDF)
 * @returns true si el tipo es válido
 */
export const validateFileType = (
  contentType: string,
  validationType: ValidationType
): boolean => {
  if (validationType === 'PHOTO') {
    return contentType.startsWith('image/');
  } else if (validationType === 'PDF') {
    return contentType === 'application/pdf';
  }
  return false;
};

/**
 * Valida las extensiones permitidas de archivo
 * @param filename Nombre del archivo
 * @param validationType Tipo esperado (PHOTO | PDF)
 * @returns true si la extensión es válida
 */
export const validateFileExtension = (
  filename: string,
  validationType: ValidationType
): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (validationType === 'PHOTO') {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  } else if (validationType === 'PDF') {
    return ext === 'pdf';
  }
  return false;
};

/**
 * Valida que el tamaño del archivo esté dentro de los límites
 * @param fileSize Tamaño en bytes
 * @param maxSizeMB Tamaño máximo en MB (default: 10MB)
 * @returns true si el tamaño es válido
 */
export const validateFileSize = (fileSize: number, maxSizeMB = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};

/**
 * Formatea el tamaño de archivo a formato legible
 * @param bytes Tamaño en bytes
 * @returns String formateado (ej: "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Obtiene el ícono apropiado según el tipo de validación
 * @param validationType PHOTO | PDF
 * @returns Nombre del ícono de Ionicons
 */
export const getValidationTypeIcon = (validationType: ValidationType): string => {
  return validationType === 'PDF' ? 'document' : 'image';
};

/**
 * Obtiene el label legible del tipo de validación
 * @param validationType PHOTO | PDF
 * @returns Label en español
 */
export const getValidationTypeLabel = (validationType: ValidationType): string => {
  return validationType === 'PDF' ? 'PDF' : 'Fotos (JPG, PNG)';
};

/**
 * Valida un objeto archivo completo
 * @param file Archivo a validar
 * @param validationType Tipo esperado
 * @param maxSizeMB Tamaño máximo en MB
 * @returns Objeto con validación: { valid: boolean, error?: string }
 */
export const validateFile = (
  file: { name: string; size: number; type: string },
  validationType: ValidationType,
  maxSizeMB = 10
): { valid: boolean; error?: string } => {
  // Validar tipo MIME
  if (!validateFileType(file.type, validationType)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Se esperaba ${getValidationTypeLabel(validationType)}`,
    };
  }

  // Validar extensión
  if (!validateFileExtension(file.name, validationType)) {
    return {
      valid: false,
      error: `Extensión de archivo no válida. Se esperaba ${getValidationTypeLabel(validationType)}`,
    };
  }

  // Validar tamaño
  if (!validateFileSize(file.size, maxSizeMB)) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Máximo: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

/**
 * Formatea una fecha de submission para display
 * @param dateString ISO string date
 * @returns Fecha formateada en español
 */
export const formatSubmissionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calcula el tiempo transcurrido desde un submission
 * @param dateString ISO string date
 * @returns String con tiempo relativo (ej: "hace 2 horas")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)}s`;
  return `hace ${Math.floor(diffDays / 30)}mes`;
};
