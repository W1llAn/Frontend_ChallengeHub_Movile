// src/contexts/AuthContext.tsx
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
import type { UserResponseDTO } from "../types/api/user.type";
import { getUserById } from "../services/user.service";
import { transformAvatarUrl } from "../utils/image-url.util";

// Cierra auth session si es necesario
WebBrowser.maybeCompleteAuthSession();

const ACCESS_TOKEN_KEY = "accessToken";

// ===== Utils =====
const safeJsonParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

// decodeToken robusto (intenta Buffer, atob, etc.)
const decodeToken = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];

    // Try Buffer (Node / some RN setups)
    try {
      // @ts-ignore Buffer may or may not exist
      if (typeof Buffer !== "undefined" && Buffer.from) {
        const decoded = JSON.parse(
          Buffer.from(payload, "base64").toString("utf-8")
        );
        return decoded;
      }
    } catch {
      // fallback
    }

    // Try atob + decodeURIComponent
    try {
      const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const str =
        typeof atob === "function" ? atob(b64) : globalThis.atob?.(b64);
      if (!str) return null;
      // Convert binary string to utf-8
      const utf8 = decodeURIComponent(
        Array.prototype.map
          .call(str, (c: string) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(utf8);
    } catch (e) {
      return null;
    }
  } catch (error) {
    console.error("Error decodificando token:", error);
    return null;
  }
};

// Storage helpers (web + mobile)
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

// Auth0 config (usa tu expoConfig.extra)
const auth0Domain =
  Constants.expoConfig?.extra?.auth0Domain || "YOUR_AUTH0_DOMAIN";
const auth0ClientId =
  Constants.expoConfig?.extra?.auth0ClientId || "YOUR_AUTH0_CLIENT_ID";
const auth0Audience =
  Constants.expoConfig?.extra?.auth0Audience || "YOUR_AUTH0_AUDIENCE";

const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";

let redirectUri: string;
if (isExpoGo) {
  try {
    redirectUri = AuthSession.makeRedirectUri({ useProxy: true } as any);
  } catch {
    const owner = Constants.expoConfig?.owner || "anonymous";
    const slug = Constants.expoConfig?.slug || "ChallengeHubMobile";
    redirectUri = `https://auth.expo.io/@${owner}/${slug}`;
  }
  if (!redirectUri) {
    const owner = Constants.expoConfig?.owner || "anonymous";
    const slug = Constants.expoConfig?.slug || "ChallengeHubMobile";
    redirectUri = `https://auth.expo.io/@${owner}/${slug}`;
  }
} else {
  redirectUri = AuthSession.makeRedirectUri({
    scheme: "frontendchallengehubmovile",
    path: "auth",
  });
  if (!redirectUri) {
    redirectUri = "challengeHub://auth";
  }
}

const discovery = {
  authorizationEndpoint: `https://${auth0Domain}/authorize`,
  tokenEndpoint: `https://${auth0Domain}/oauth/token`,
  revocationEndpoint: `https://${auth0Domain}/oauth/revoke`,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractUserIdFromSub = (sub: string | undefined): number | null => {
  if (!sub) return null;
  try {
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

const clearInconsistentAuth = async () => {
  await storage.removeItem(ACCESS_TOKEN_KEY);
  await storage.removeItem("user");
  await storage.removeItem("completeUser");
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [completeUser, setCompleteUser] = useState<UserResponseDTO | null>(
    null
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Al iniciar, cargar sesión desde storage - VERSIÓN CORREGIDA
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem(ACCESS_TOKEN_KEY);
        const storedUser = await storage.getItem("user");
        const storedCompleteUser = await storage.getItem("completeUser");

        if (token && storedUser) {
          
          setAccessToken(token);
          const parsedUser = safeJsonParse(storedUser);
          setUser(parsedUser);
          // ===== SOLUCIÓN SIMPLE: Si no hay completeUser, limpiar sesión inconsistente =====

          if (storedCompleteUser) {
            const parsedCompleteUser = safeJsonParse(storedCompleteUser);
            
            if (parsedCompleteUser) {
              const transformedAvatarUrl = transformAvatarUrl(parsedCompleteUser.avatarUrl);
              parsedCompleteUser.avatarUrl = transformedAvatarUrl || parsedCompleteUser.avatarUrl;
            }
            
            setCompleteUser(parsedCompleteUser);
          } else {
            await clearInconsistentAuth();
            setAccessToken(null);
            setUser(null);
            setCompleteUser(null);
          }
        }
      } catch (error) {
        console.error("[Auth] Error cargando sesión:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // AuthRequest
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

  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success") {
        const token = response.params.id_token || response.params.access_token;
        if (!token) return;

        try {

          let userInfo = decodeToken(token);

          if (!userInfo) {
            const userInfoResponse = await fetch(
              `https://${auth0Domain}/userinfo`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (userInfoResponse.status !== 200) {
              setAuthError("No se pudo obtener userinfo desde Auth0");
              return;
            }
            userInfo = await userInfoResponse.json();
          }

          try {
            await storage.setItem(ACCESS_TOKEN_KEY, token);
            await storage.setItem("user", JSON.stringify(userInfo));
          } catch (storeErr) {
            console.warn("No se pudo guardar token en storage:", storeErr);
          }

          setAccessToken(token);
          setUser(userInfo);

          const extractedUserId = extractUserIdFromSub(userInfo.sub);
          if (extractedUserId) {
            setUserId(extractedUserId);
          }

          try {
            if (extractedUserId) {
              const backendUser = await getUserById(extractedUserId);
              if (backendUser) {
                const transformedAvatarUrl = transformAvatarUrl(backendUser.avatarUrl);
                
                const userWithTransformedAvatar = {
                  ...backendUser,
                  avatarUrl: transformedAvatarUrl || backendUser.avatarUrl,
                };
                
                setCompleteUser(userWithTransformedAvatar);
                try {
                  await storage.setItem("completeUser", JSON.stringify(userWithTransformedAvatar));
                } catch (storeErr) {
                  console.warn("[Auth] No se pudo guardar completeUser en storage:", storeErr);
                }
              }
            }
          } catch (err) {
            // Error silencioso en producción
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error("Error en handleAuth:", errorMsg);
          setAuthError(errorMsg);
        }
      } else if (response?.type === "error") {
        const errorMsg =
          response?.params?.error || "Error desconocido en Auth0";
        console.error("❌ Error en respuesta de Auth0:", errorMsg);
        setAuthError(errorMsg);
      }
    };

    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const login = async () => {
    setAuthError(null);
    await promptAsync({} as any);
  };

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
    } catch (err) {
      // ignore
    } finally {
      await storage.removeItem(ACCESS_TOKEN_KEY);
      await storage.removeItem("user");
      await storage.removeItem("completeUser");

      setAccessToken(null);
      setUser(null);
      setCompleteUser(null);
      setUserId(null);
      setAuthError(null);
    }
  };

  // Función simple para limpiar sesión manualmente
  const clearAuthData = async () => {
    await clearInconsistentAuth();
    setAccessToken(null);
    setUser(null);
    setCompleteUser(null);
    setAuthError(null);
  };

  const value: AuthContextType = {
    user,
    completeUser,
    accessToken,
    isSignedIn: !!user && !!completeUser,
    loading,
    authError,
    login,
    logout,
    clearAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook consumidor
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};