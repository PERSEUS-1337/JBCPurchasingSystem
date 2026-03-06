"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { login as loginApi, logout as logoutApi } from "@/lib/api/auth";
import { getAllUsers, getMe } from "@/lib/api/users";
import {
  clearAuthToken,
  getAuthToken,
  HttpError,
  setAuthToken,
} from "@/lib/api/client";
import { User } from "@/lib/types/user";

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isInitializing: boolean;
  login: (payload: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

async function resolveSuperAdminStatus(): Promise<boolean> {
  try {
    await getAllUsers();
    return true;
  } catch (error) {
    if (error instanceof HttpError && error.status === 403) {
      return false;
    }

    if (error instanceof HttpError && error.status === 401) {
      return false;
    }

    throw error;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const resetAuth = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setIsSuperAdmin(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await getMe();
    setUser(response.data);

    const adminStatus = await resolveSuperAdminStatus();
    setIsSuperAdmin(adminStatus);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        await refreshUser();
      } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
          resetAuth();
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [refreshUser, resetAuth]);

  const login = useCallback(async (payload: LoginInput) => {
    const response = await loginApi(payload);
    setAuthToken(response.data.bearer);
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      resetAuth();
    }
  }, [resetAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isSuperAdmin,
      isInitializing,
      login,
      logout,
      refreshUser,
    }),
    [isInitializing, isSuperAdmin, login, logout, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
