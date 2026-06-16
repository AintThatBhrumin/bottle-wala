"use client";

import { create } from "zustand";

import { authApi } from "@/lib/api/auth";
import { routes } from "@/lib/constants/routes";
import { useCartStore } from "@/lib/stores/cart-store";
import type { LoginPayload, RegisterPayload, User, UserRole } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthStore = {
  user: User | null;
  status: AuthStatus;
  initialized: boolean;
  initializeSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  defaultRouteForRole: (role?: UserRole | null) => string;
};

let initializePromise: Promise<void> | null = null;

function getDefaultRouteForRole(role?: UserRole | null) {
  if (role === "admin") {
    return routes.revenueDashboard;
  }
  if (role === "supplier") {
    return routes.supplierDashboard;
  }

  return routes.suppliers;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  status: "loading",
  initialized: false,
  initializeSession: async () => {
    if (get().initialized) {
      return;
    }

    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      set((state) => ({
        ...state,
        status: state.user ? "authenticated" : "loading"
      }));

      try {
        const user = await authApi.me();
        set({
          user,
          status: "authenticated",
          initialized: true
        });
      } catch {
        set({
          user: null,
          status: "unauthenticated",
          initialized: true
        });
      } finally {
        initializePromise = null;
      }
    })();

    return initializePromise;
  },
  refreshUser: async () => {
    set((state) => ({
      ...state,
      status: state.user ? "authenticated" : "loading"
    }));

    try {
      const user = await authApi.me();
      set({
        user,
        status: "authenticated",
        initialized: true
      });
    } catch {
      set({
        user: null,
        status: "unauthenticated",
        initialized: true
      });
    }
  },
  login: async (payload) => {
    const response = await authApi.login(payload);
    set({
      user: response.user,
      status: "authenticated",
      initialized: true
    });
    return response.user;
  },
  register: async (payload) => {
    const response = await authApi.register(payload);
    set({
      user: response.user,
      status: "authenticated",
      initialized: true
    });
    return response.user;
  },
  logout: async () => {
    await authApi.logout();
    useCartStore.getState().clearCart();
    set({
      user: null,
      status: "unauthenticated",
      initialized: true
    });
  },
  defaultRouteForRole: (role) => getDefaultRouteForRole(role)
}));
