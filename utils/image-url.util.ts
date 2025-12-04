/**
 * Utilidad para transformar URLs de imágenes
 * Reemplaza localhost por la IP de la máquina para acceso desde dispositivos móviles
 */
import Constants from "expo-constants";

/**
 * Transforma una URL que contiene localhost por la IP real de la máquina
 * Esto es necesario para acceder a contenedores Docker desde dispositivos móviles
 * 
 * @param url - URL original que puede contener localhost
 * @returns URL transformada con la IP de la máquina
 * 
 * @example
 * // URL original: http://localhost:9000/challenge-hub/image.png
 * // URL transformada: http://10.79.12.254:9000/challenge-hub/image.png
 */
export const transformImageUrl = (url: string | null | undefined): string | null => {
  if (!url) {
    return null;
  }

  // Obtener la IP desde las variables de entorno
  const ipAddress = Constants.expoConfig?.extra?.ipAddress;
  
  if (!ipAddress) {
    console.warn("[transformImageUrl] IP_ADDRESS no configurada en .env, usando URL original");
    return url;
  }

  // Verificar si la URL contiene localhost
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const transformedUrl = url
      .replace("localhost", ipAddress)
      .replace("127.0.0.1", ipAddress);
    
    return transformedUrl;
  }

  // Si no contiene localhost, retornar la URL original
  return url;
};

/**
 * Transforma una URL de avatar, manejando casos especiales
 * 
 * @param avatarUrl - URL del avatar que puede ser de Auth0, Minio u otro origen
 * @returns URL transformada lista para usar
 */
export const transformAvatarUrl = (avatarUrl: string | null | undefined): string | null => {
  return transformImageUrl(avatarUrl);
};

/**
 * Transforma una URL de imagen de desafío/categoría
 * 
 * @param imageUrl - URL de la imagen
 * @returns URL transformada lista para usar
 */
export const transformChallengeImageUrl = (imageUrl: string | null | undefined): string | null => {
  return transformImageUrl(imageUrl);
};

/**
 * Transforma una URL de documento/archivo para avances de retos
 * Reemplaza localhost por la IP de la máquina para acceder a archivos desde dispositivos móviles
 * 
 * @param documentUrl - URL del documento/archivo que puede contener localhost
 * @returns URL transformada lista para usar
 * 
 * @example
 * // PDF de avance: http://localhost:9000/challenge-hub/progress-doc.pdf
 * // Transformada: http://10.79.12.254:9000/challenge-hub/progress-doc.pdf
 */
export const transformDocumentUrl = (documentUrl: string | null | undefined): string | null => {
  return transformImageUrl(documentUrl);
};

/**
 * Transforma un array de URLs (útil para múltiples documentos/imágenes)
 * 
 * @param urls - Array de URLs que pueden contener localhost
 * @returns Array de URLs transformadas
 * 
 * @example
 * const urls = ['http://localhost:9000/file1.pdf', 'http://localhost:9000/file2.jpg'];
 * const transformed = transformUrlArray(urls);
 * // ['http://10.79.12.254:9000/file1.pdf', 'http://10.79.12.254:9000/file2.jpg']
 */
export const transformUrlArray = (urls: (string | null | undefined)[]): (string | null)[] => {
  return urls.map(url => transformImageUrl(url));
};

/**
 * Transforma cualquier URL genérica (imágenes, documentos, videos, etc.)
 * Función genérica que puede usarse para cualquier tipo de recurso
 * 
 * @param url - URL del recurso que puede contener localhost
 * @returns URL transformada lista para usar
 * 
 * @example
 * transformUrl('http://localhost:9000/challenge-hub/video.mp4')
 * transformUrl('http://localhost:9000/challenge-hub/document.pdf')
 * transformUrl('http://localhost:9000/challenge-hub/image.png')
 */
export const transformUrl = (url: string | null | undefined): string | null => {
  return transformImageUrl(url);
};
