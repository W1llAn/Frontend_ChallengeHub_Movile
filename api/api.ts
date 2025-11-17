// api/api.ts
import { useEffect } from "react";
import axios, {
  AxiosError,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuth } from "../contexts/AuthContext";
import { showNotifier } from "../services/notifier";
import type { ErrorResponseData } from "../types/api/api.type";

// 🔹 Base URL desde variables de entorno de Expo
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE ?? "http://10.0.2.2:8080";

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

// 🔹 Hook que te devuelve el api YA autenticado con Auth0
export const useApi = () => {
  const { accessToken, logout } = useAuth();

  useEffect(() => {
    // Interceptor de REQUEST: agrega el Bearer token si existe
    const reqId = api.interceptors.request.use(
      (config: InternalAxiosRequestConfig<any>) => {
        if (accessToken) {
          if (!config.headers) {
            config.headers = {} as AxiosRequestHeaders;
          }
          (
            config.headers as AxiosRequestHeaders
          ).Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de RESPONSE: manejo centralizado de errores + notifier
    const resId = api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        const status = error.response?.status;
        const message = extractErrorMessage(error);

        if (status === 401) {
          showNotifier(message, "error");
          // cerramos sesión global (AuthContext ya se encarga de limpiar storage y redirigir)
          logout();
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

    // Limpiar interceptores cuando cambie el token o se desmonte el componente
    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, [accessToken, logout]);

  return api;
};
