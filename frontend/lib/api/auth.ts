"use client";

import { apiClient } from "@/lib/api/client";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types/auth";

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },
  async register(payload: RegisterPayload) {
    const response = await apiClient.post<AuthResponse>("/auth/register", payload);
    return response.data;
  },
  async me() {
    const response = await apiClient.get<AuthResponse>("/auth/me");
    return response.data.user as User;
  },
  async logout() {
    await apiClient.post("/auth/logout");
  }
};
