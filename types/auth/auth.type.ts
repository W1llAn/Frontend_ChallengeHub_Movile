import type { UserResponseDTO } from "../api/user.type";

export interface AuthUser {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  nickname?: string;
  updated_at?: string;
  [key: string]: any; // Para permitir campos personalizados de Auth0
}

export interface AuthContextType {
  user: AuthUser | null;
  completeUser: UserResponseDTO | null;
  accessToken: string | null;
  isSignedIn: boolean;
  loading: boolean;
  authError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthData?: () => Promise<void>;
}
