import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import { AuthContextType, AuthUser } from "../types/auth/auth.type";
import { getUserById } from "../services/user.service";
import { attachAuthInterceptor } from "../api/api";
import type { UserResponseDTO } from "../types/api/user.type";

// Configurar WebBrowser para cerrar automáticamente después del login
WebBrowser.maybeCompleteAuthSession();

// ===== HELPER: Decodificar JWT manualmente =====
const decodeToken = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 && parts.length !== 5) {
      return null;
    }

    if (parts.length === 3) {
      const payload = parts[1];
      const decoded = JSON.parse(
        Buffer.from(payload, "base64").toString("utf-8")
      );
      return decoded;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error decodificando token:", error);
    return null;
  }
};

// ===== STORAGE HELPERS (Web + Mobile) =====
const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async removeItem(key: string) {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

// ===== CONFIGURACIÓN DE AUTH0 =====
const auth0Domain =
  Constants.expoConfig?.extra?.auth0Domain || "YOUR_AUTH0_DOMAIN";
const auth0ClientId =
  Constants.expoConfig?.extra?.auth0ClientId || "YOUR_AUTH0_CLIENT_ID";
const auth0Audience =
  Constants.expoConfig?.extra?.auth0Audience || "YOUR_AUTH0_AUDIENCE";

// ===== DETECTAR ENTORNO =====
const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";

// Generar redirectUri dinámico según entorno
let redirectUri: string;

if (isExpoGo) {
  // Para Expo Go (trabajo remoto): usar proxy de Expo
  try {
    redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    } as any);
  } catch {
    const owner = Constants.expoConfig?.owner || "anonymous";
    const slug = Constants.expoConfig?.slug || "ChallengeHubMobile";
    redirectUri = `https://auth.expo.io/@${owner}/${slug}`;
  }

  // Si falla, usar URI manual
  if (!redirectUri) {
    const owner = Constants.expoConfig?.owner || "anonymous";
    const slug = Constants.expoConfig?.slug || "ChallengeHubMobile";
    redirectUri = `https://auth.expo.io/@${owner}/${slug}`;
  }
} else {
  // En build nativa: usar esquema propio
  redirectUri = AuthSession.makeRedirectUri({
    scheme: "frontendchallengehubmovile",
    path: "auth",
  });

  if (!redirectUri) {
    redirectUri = "challengeHub://auth";
  }
}

// ===== DISCOVERY AUTH0 =====
const discovery = {
  authorizationEndpoint: `https://${auth0Domain}/authorize`,
  tokenEndpoint: `https://${auth0Domain}/oauth/token`,
  revocationEndpoint: `https://${auth0Domain}/oauth/revoke`,
};

// ===== CONTEXTO =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== HELPER: Extraer ID del usuario de Auth0 =====
const extractUserIdFromSub = (sub: string | undefined): number | null => {
  if (!sub) return null;
  try {
    // El sub tiene formato: "auth0|xxxxx" o similar
    const parts = sub.split("|");
    if (parts.length >= 2) {
      const id = parseInt(parts[parts.length - 1], 10);
      return isNaN(id) ? null : id;
    }
    return null;
  } catch (error) {
    console.error("Error extrayendo ID del sub:", error);
    return null;
  }
};

// ===== HELPER: Obtener usuario completo del backend =====
const fetchCompleteUserData = async (
  userId: number,
  token: string
): Promise<UserResponseDTO | null> => {
  try {
    const userData = await getUserById(userId);
    return userData;
  } catch (error) {
    console.error("Error obteniendo datos del usuario del backend:", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [completeUser, setCompleteUser] = useState<UserResponseDTO | null>(
    null
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Cargar sesión almacenada al iniciar
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem("accessToken");
        const storedUser = await storage.getItem("user");
        const storedCompleteUser = await storage.getItem("completeUser");

        if (token && storedUser) {
          setAccessToken(token);
          setUser(JSON.parse(storedUser));

          if (storedCompleteUser) {
            setCompleteUser(JSON.parse(storedCompleteUser));
          }
        }
      } catch (error) {
        // Error silencioso
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ===== NUEVA LÓGICA: Función getAccessTokenSilently similar a Auth0-React =====
  // Se obtiene el token de forma asincrónica para cada petición API
  const getAccessTokenSilently = async (): Promise<string | null> => {
    try {
      const token = accessToken;
      if (!token) {
        return null;
      }
      // Aquí podrías agregar lógica de renovación de token si fuera necesario
      return token;
    } catch (error) {
      console.error("Error en getAccessTokenSilently:", error);
      return null;
    }
  };

  // Configurar interceptores cuando el componente monta o cuando cambia accessToken
  useEffect(() => {
    attachAuthInterceptor(getAccessTokenSilently);
  }, [accessToken]);

  // Crear Auth Request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0ClientId,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Token,
      extraParams: {
        audience: auth0Audience,
      },
    },
    discovery
  );

  // Manejar respuesta de Auth0
  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success") {
        // Preferencia: id_token > access_token
        const token = response.params.id_token || response.params.access_token;

        if (!token) {
          return;
        }

        console.log("JWT Token:", token);

        try {
          // Intentar decodificar directamente si es JWT
          let userInfo = decodeToken(token);

          // Si no se pudo decodificar o es JWE, usar userinfo endpoint
          if (!userInfo) {
            const userInfoResponse = await fetch(
              `https://${auth0Domain}/userinfo`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            userInfo = await userInfoResponse.json();

            if (userInfoResponse.status !== 200) {
              return;
            }
          }

          console.log("Usuario Auth0:", userInfo);

          // ===== NUEVA LÓGICA: Obtener usuario completo del backend =====
          let completeUserData: UserResponseDTO | null = null;
          const userId = extractUserIdFromSub(userInfo.sub);

          console.log("\n========== AUTH FLOW ==========");
          console.log("JWT Token recibido:", token);

          if (userId) {
            console.log("✅ ID de usuario extraído del sub:", userId);
            completeUserData = await fetchCompleteUserData(userId, token);

            if (completeUserData) {
              console.log(
                "✅ Datos completos del usuario obtenidos:",
                completeUserData
              );
              console.log("================================\n");
            } else {
              const errorMsg =
                "No se pudieron obtener los datos completos del usuario";
              console.warn("❌", errorMsg);
              console.log("================================\n");
              setAuthError(errorMsg);
            }
          } else {
            const errorMsg = "No se pudo extraer el ID del usuario del token";
            console.error("❌", errorMsg);
            console.log("================================\n");
            setAuthError(errorMsg);
          }

          // Guardar en storage
          try {
            await storage.setItem("accessToken", token);
            await storage.setItem("user", JSON.stringify(userInfo));
            if (completeUserData) {
              await storage.setItem(
                "completeUser",
                JSON.stringify(completeUserData)
              );
            }
          } catch (storeError) {
            // Error silencioso
          }

          setAccessToken(token);
          setUser(userInfo);
          if (completeUserData) {
            setCompleteUser(completeUserData);
          }
        } catch (error) {
          // Error en autenticación
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error("❌ Error en handleAuth:", errorMsg);
          setAuthError(errorMsg);
        }
      } else if (response?.type === "error") {
        // Error en respuesta de Auth0
        const errorMsg =
          response?.params?.error || "Error desconocido en Auth0";
        console.error("❌ Error en respuesta de Auth0:", errorMsg);
        setAuthError(errorMsg);
      }
    };
    handleAuth();
  }, [response]);

  // Iniciar sesión
  const login = async () => {
    setAuthError(null);
    await promptAsync({} as any);
  };

  // Cerrar sesión (local + Auth0)
  const logout = async () => {
    try {
      const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(
        redirectUri
      )}`;

      if (Platform.OS === "web") {
        window.location.href = logoutUrl;
      } else {
        await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
      }

      await storage.removeItem("accessToken");
      await storage.removeItem("user");
      await storage.removeItem("completeUser");

      setAccessToken(null);
      setUser(null);
      setCompleteUser(null);
    } catch (error) {
      await storage.removeItem("accessToken");
      await storage.removeItem("user");
      await storage.removeItem("completeUser");
      setAccessToken(null);
      setUser(null);
      setCompleteUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    completeUser,
    accessToken,
    isSignedIn: !!user,
    loading,
    authError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ===== HOOK PERSONALIZADO =====
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
