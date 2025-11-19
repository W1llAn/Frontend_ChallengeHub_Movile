// api/api.ts
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { showNotifier } from "../services/notifier";
import type { ErrorResponseData } from "../types/api/api.type";

// Base URL desde variables de entorno de Expo (fallback a localhost)
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// 🔹 Helper para extraer mensaje de error del backend
const extractErrorMessage = (error: AxiosError<any>) => {
  const data = error.response?.data as ErrorResponseData | any;

  if (data?.message && Array.isArray(data?.errors) && data.errors.length) {
    const list =
      typeof data.errors[0] === "string"
        ? data.errors.join(", ")
        : data.errors
            .map((e: any) => e?.defaultMessage ?? e?.message ?? "")
            .filter(Boolean)
            .join(", ");

    return `${data.message}: ${list}`;
  }

  if (typeof data?.message === "string") return data.message;

  if (Array.isArray(data?.errors) && data.errors[0]?.defaultMessage) {
    return data.errors.map((e: any) => e.defaultMessage).join(", ");
  }

  if (typeof data === "string") return data;

  const status = error.response?.status;
  if (status === 400) return "Solicitud inválida.";
  if (status === 401) return "Sesión expirada. Vuelve a iniciar sesión.";
  if (status === 403) return "Acceso denegado.";
  if (status === 404) return "Recurso no encontrado.";
  if (status === 409) return "Conflicto: recurso duplicado.";
  if (status && status >= 500) return "Error del servidor. Intenta más tarde.";

  return "Ocurrió un error. Intenta nuevamente.";
};

// 🔹 Configurar interceptores del API - Similar a web
// getAccessTokenSilently debe ser una función que devuelve Promise<string>
export const attachAuthInterceptor = (
  getAccessTokenSilently: () => Promise<string | null>
) => {
  // Request interceptor: obtiene token de forma ASINCRÓNICA antes de cada petición
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig<any>) => {
      try {
        const token = await getAccessTokenSilently();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;

          // Logs útiles para debugging
          const tokenParts = token.split(".");
          const tokenType =
            tokenParts.length === 3
              ? "JWS/JWT"
              : tokenParts.length === 5
              ? "JWE"
              : "Unknown";

          // Mostrar logs sin exponer token completo (mask)
          const masked =
            token.length > 20
              ? `${token.substring(0, 8)}...${token.substring(
                  token.length - 6
                )}`
              : token;

          console.log("\n========== API REQUEST ==========");
          console.log(
            "Método:",
            (config.method || "").toString().toUpperCase()
          );
          console.log("URL:", config.url);
          console.log("Token Type:", tokenType);
          console.log("Token (masked):", masked);
          console.log("Token (full):", token); // Para debugging completo
          console.log("================================\n");
        } else {
          console.warn("⚠️ No token available for this request");
        }
      } catch (err) {
        console.error("❌ Error obteniendo token:", err);
        // No agregar header si falla obtener token
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: manejo centralizado de errores
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
      const status = error.response?.status;
      const message = extractErrorMessage(error);

      if (status === 401) {
        showNotifier(message, "error");
        // El logout se maneja desde el componente al detectar isSignedIn = false
      } else if (status && status >= 400 && status < 500) {
        showNotifier(message || "Error en la solicitud.", "warn");
      } else if (status && status >= 500) {
        showNotifier(
          message || "Error del servidor, intenta más tarde.",
          "error"
        );
      } else {
        showNotifier(message, "error");
      }

      return Promise.reject(error);
    }
  );
};

export default api;
