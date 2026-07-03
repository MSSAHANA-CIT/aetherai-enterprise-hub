import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, api, type ApiUser } from "../lib/api";

export type UserRole = "employee" | "manager" | "admin" | "admin_request" | "super_admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole | string;
  isActive: boolean;
  initials: string;
  avatarColor: string;
}

interface RegisterData {
  name: string;
  email: string;
  company: string;
  password: string;
  confirmPassword: string;
  role: "employee" | "manager" | "admin_request";
}

export interface RegisterOtpResult {
  email: string;
  expiresInMinutes: number;
  message: string;
  purpose: "signup";
}

export interface LoginOtpResult {
  email: string;
  expiresInMinutes: number;
  message: string;
  purpose: "login" | "signup";
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isManager: boolean;
  loading: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  requestLoginOtp: (email: string, password: string) => Promise<LoginOtpResult>;
  verifyLoginOtp: (email: string, otp: string) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterOtpResult>;
  verifySignupOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const STORAGE_KEYS = {
  token: "access_token",
  user: "user",
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function mapApiUser(user: ApiUser): AuthUser {
  return {
    id: String(user.id),
    name: user.full_name,
    email: user.email,
    company: user.company_name,
    role: user.role,
    isActive: user.is_active,
    initials: getInitials(user.full_name),
    avatarColor: "from-aether-500 to-purple-600",
  };
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.token);
  } catch {
    return null;
  }
}

function persistAuth(token: string, user: AuthUser): void {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

function isAdminRole(role: string | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

function isSuperAdminRole(role: string | undefined): boolean {
  return role === "super_admin";
}

function isManagerRole(role: string | undefined): boolean {
  return role === "manager" || isAdminRole(role);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = readStoredToken();
    if (!currentToken) return;

    try {
      const currentUser = await api.getMe(currentToken);
      const mappedUser = mapApiUser(currentUser);
      persistAuth(currentToken, mappedUser);
      setUser(mappedUser);
      setToken(currentToken);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 0)) {
        clearAuth();
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = readStoredToken();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const currentUser = await api.getMe(storedToken);
        const mappedUser = mapApiUser(currentUser);
        persistAuth(storedToken, mappedUser);
        setUser(mappedUser);
      } catch (error) {
        const storedUser = readStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
        if (error instanceof ApiError && (error.status === 401 || error.status === 0)) {
          clearAuth();
          setUser(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  const requestLoginOtp = useCallback(async (email: string, password: string): Promise<LoginOtpResult> => {
    if (!email.trim() || !password.trim()) {
      throw new Error("Email and password are required.");
    }

    try {
      const response = await api.login({
        email: email.trim().toLowerCase(),
        password,
      });
      return {
        email: response.data.email,
        expiresInMinutes: response.data.expires_in_minutes,
        message: response.message,
        purpose: response.data.purpose === "signup" ? "signup" : "login",
      };
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[AetherAI Auth] Login failed:", error.message);
        throw new Error(error.message);
      }
      throw error;
    }
  }, []);

  const verifyLoginOtp = useCallback(async (email: string, otp: string) => {
    try {
      const response = await api.verifyLoginOtp({
        email: email.trim().toLowerCase(),
        otp,
      });
      const mappedUser = mapApiUser(response.user);
      persistAuth(response.access_token, mappedUser);
      setToken(response.access_token);
      setUser(mappedUser);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<RegisterOtpResult> => {
    try {
      const response = await api.register({
        full_name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        company_name: data.company.trim(),
        password: data.password,
        confirm_password: data.confirmPassword,
        role: data.role,
      });
      return {
        email: response.data.email,
        expiresInMinutes: response.data.expires_in_minutes,
        message: response.message,
        purpose: "signup",
      };
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[AetherAI Auth] Register failed:", error.message);
        throw new Error(error.message);
      }
      throw error;
    }
  }, []);

  const verifySignupOtp = useCallback(async (email: string, otp: string) => {
    try {
      const response = await api.verifySignupOtp({
        email: email.trim().toLowerCase(),
        otp,
      });
      const mappedUser = mapApiUser(response.user);
      persistAuth(response.access_token, mappedUser);
      setToken(response.access_token);
      setUser(mappedUser);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user?.role) return false;
      return roles.includes(user.role as UserRole);
    },
    [user?.role]
  );

  const isAdmin = isAdminRole(user?.role);
  const isSuperAdmin = isSuperAdminRole(user?.role);
  const isManager = isManagerRole(user?.role);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin,
      isSuperAdmin,
      isManager,
      loading,
      hasRole,
      requestLoginOtp,
      verifyLoginOtp,
      register,
      verifySignupOtp,
      logout,
      refreshUser,
    }),
    [
      user,
      token,
      isAdmin,
      isSuperAdmin,
      isManager,
      loading,
      hasRole,
      requestLoginOtp,
      verifyLoginOtp,
      register,
      verifySignupOtp,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
