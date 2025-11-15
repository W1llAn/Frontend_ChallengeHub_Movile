export interface AuthUser {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isSignedIn: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}