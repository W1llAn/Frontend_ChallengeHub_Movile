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

// Configurar WebBrowser para cerrar automáticamente después del login
WebBrowser.maybeCompleteAuthSession();

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

// ===== DETECTAR ENTORNO =====
const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";

// Generar redirectUri dinámico según entorno
let redirectUri: string;

if (isExpoGo) {
  // Para Expo Go (trabajo remoto): usar proxy de Expo
  // Esto genera una URI consistente: https://auth.expo.io/@owner/slug
  // @ts-ignore - useProxy no está tipado pero funciona
  redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  // Si falla, usar URI manual basada en el owner y slug del proyecto
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

console.log("=== Configuración de Auth0 ===");
console.log("Entorno:", isExpoGo ? "Expo Go" : "Build nativa");
console.log("Redirect URI usada:", redirectUri);
console.log("=============================");

// ===== DISCOVERY AUTH0 =====
const discovery = {
  authorizationEndpoint: `https://${auth0Domain}/authorize`,
  tokenEndpoint: `https://${auth0Domain}/oauth/token`,
  revocationEndpoint: `https://${auth0Domain}/oauth/revoke`,
};

// ===== CONTEXTO =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión almacenada al iniciar
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem("accessToken");
        const storedUser = await storage.getItem("user");

        console.log("Cargando sesión:", {
          hasToken: !!token,
          hasUser: !!storedUser,
        });

        if (token && storedUser) {
          setAccessToken(token);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Crear Auth Request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0ClientId,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Token,
    },
    discovery
  );

  // Manejar respuesta de Auth0
  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success" && response.params.access_token) {
        const token = response.params.access_token;
        try {
          const userInfoResponse = await fetch(
            `https://${auth0Domain}/userinfo`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const userInfo = await userInfoResponse.json();

          console.log("Usuario autenticado:", userInfo);

          // Guardar en storage (localStorage para web, SecureStore para mobile)
          try {
            await storage.setItem("accessToken", token);
            await storage.setItem("user", JSON.stringify(userInfo));
            console.log("Credenciales guardadas correctamente");
          } catch (storeError) {
            console.log("Error guardando en storage:", storeError);
          }

          setAccessToken(token);
          setUser(userInfo);
        } catch (error) {
          console.log("Error fetching user info:", error);
        }
      } else if (response?.type === "error") {
        console.log("Error en autenticación:", response.error);
      }
    };
    handleAuth();
  }, [response]);

  // Iniciar sesión
  const login = async () => {
    console.log("Iniciando login...");
    console.log("Redirect URI usada:", redirectUri);

    // En Expo Go usamos el proxy, en build nativa no
    // @ts-ignore - useProxy no está tipado pero funciona en Expo Go
    await promptAsync(isExpoGo ? { useProxy: true } : {});
  };

  // Cerrar sesión (local + Auth0)
  const logout = async () => {
    try {
      // 1. Cerrar sesión en Auth0 primero
      const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(
        redirectUri
      )}`;

      if (Platform.OS === "web") {
        // En web, redirigir directamente al logout de Auth0
        console.log(
          " AuthContext: Plataforma web, redirigiendo a Auth0 logout"
        );
        window.location.href = logoutUrl;
      } else {
        // En mobile, usar WebBrowser
        console.log("AuthContext: Plataforma mobile, usando WebBrowser");
        await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
      }

      // 2. Limpiar sesión local
      console.log("uthContext: Limpiando sesión local...");
      await storage.removeItem("accessToken");
      await storage.removeItem("user");

      setAccessToken(null);
      setUser(null);
      console.log("AuthContext: Estado actualizado (user=null, token=null)");

      console.log("AuthContext: Sesión cerrada completamente");
    } catch (error) {
      console.log("AuthContext: Error en logout:", error);
      // Asegurar limpieza local aunque falle Auth0
      await storage.removeItem("accessToken");
      await storage.removeItem("user");
      setAccessToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isSignedIn: !!user,
    loading,
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
