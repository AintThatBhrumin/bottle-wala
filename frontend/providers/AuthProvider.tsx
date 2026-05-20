"use client";

import { useEffect, type PropsWithChildren } from "react";

import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthProvider({ children }: PropsWithChildren) {
  const initializeSession = useAuthStore((state) => state.initializeSession);

  useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  return children;
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const initialized = useAuthStore((state) => state.initialized);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const defaultRouteForRole = useAuthStore((state) => state.defaultRouteForRole);

  return {
    user,
    status,
    isLoading: status === "loading" || !initialized,
    isAuthenticated: status === "authenticated" && Boolean(user),
    initialized,
    login,
    register,
    logout,
    refreshUser,
    defaultRouteForRole
  };
}
