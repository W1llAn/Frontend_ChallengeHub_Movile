// src/api/api.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { showNotifier } from "../services/notifier";
import type { ErrorResponseData } from "../types/api/api.type";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE;
const ACCESS_TOKEN_KEY = "accessToken";

const getTokenFromStorage = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    }
  } catch (err) {
    console.warn("getTokenFromStorage error:", err);
    return null;
  }
};

const maskToken = (token: string | null | undefined) => {
  if (!token) return null;
  if (token.length <= 20) return token;
  //return `${token.substring(0, 8)}...${token.substring(token.length - 6)}`;
  return token;
};

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

class ApiService {
  private static _instance: ApiService | null = null;
  public client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    // No añadir la cabecera personalizada en web: provoca preflight CORS extra
    headers: (() => {
      const base: Record<string, string> = { "Content-Type": "application/json" };
      try {
        if (Platform.OS !== "web") {
          base["ngrok-skip-browser-warning"] = "true";
        }
      } catch (e) {
        // En entornos donde Platform no esté disponible, no añadimos el header
      }
      return base;
    })(),
  });
  private interceptorsAttached = false;

  private constructor() {
    this.attachInterceptorsOnce();
  }

  public static getInstance(): ApiService {
    if (!ApiService._instance) {
      ApiService._instance = new ApiService();
    }
    return ApiService._instance;
  }

  private attachInterceptorsOnce() {
    if (this.interceptorsAttached) return;

    // Request interceptor: obtiene token desde storage justo antes de la petición
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig<any>) => {
        try {
          const token = await getTokenFromStorage();
          console.log("Token leído en interceptor:", maskToken(token));

          if (token) {
            config.headers = config.headers ?? {};
            (config.headers as any).Authorization = `Bearer ${token}`;

            // Información de debugging
            const method = (config.method || "GET").toString().toUpperCase();
            console.log("\n===== API REQUEST =====");
            console.log("Method:", method);
            console.log(
              "URL:",
              config.baseURL ? `${config.baseURL}${config.url}` : config.url
            );
            console.log("Token (masked):", maskToken(token));
            console.log("=======================\n");
          } else {
            console.warn("⚠️ No token disponible en storage para la petición");
          }
        } catch (err) {
          console.error("❌ Error en request interceptor:", err);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para manejo centralizado de errores
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        const status = error.response?.status;
        const message = extractErrorMessage(error);

        if (status === 401) {
          showNotifier(message, "error");
          // Si necesitas forzar logout, emite un evento aquí o usa otra estrategia.
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

    this.interceptorsAttached = true;
  }
}

const Api = ApiService.getInstance().client;
export default Api;
export { Api as api };
