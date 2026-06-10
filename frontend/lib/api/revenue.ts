"use client";

import { apiClient } from "@/lib/api/client";
import type {
  RevenueDashboard,
  SupplierPayout,
  SupplierPromotionPayload,
  SubscriptionUpgradePayload
} from "@/types/revenue";

export const revenueApi = {
  async getDashboard() {
    const response = await apiClient.get<RevenueDashboard>("/proxy/revenue/dashboard/");
    return response.data;
  },
  async getMonthlyRevenue() {
    const response = await apiClient.get<RevenueDashboard["revenue_growth"]>("/proxy/revenue/monthly/");
    return response.data;
  },
  async getSupplierPayouts() {
    const response = await apiClient.get<SupplierPayout[]>("/proxy/supplier/payouts/");
    return response.data;
  },
  async upgradeSubscription(payload: SubscriptionUpgradePayload) {
    const response = await apiClient.post("/proxy/subscription/upgrade/", payload);
    return response.data;
  },
  async promoteSupplier(payload: SupplierPromotionPayload) {
    const response = await apiClient.post("/proxy/supplier/promote/", payload);
    return response.data;
  }
};
