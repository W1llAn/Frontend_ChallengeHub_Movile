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
