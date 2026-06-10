export type RevenueTotals = {
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;
};

export type RevenueBreakdown = {
  commission?: string;
  sticker_fee?: string;
  subscription?: string;
  promoted_listing?: string;
  delivery_margin?: string;
};

export type MonthlyRevenuePoint = {
  month: string;
  revenue: string;
  transactions: number;
};

export type MonthlyOrderPoint = {
  month: string;
  orders: number;
  supplier_earnings: string;
};

export type RevenueDashboard = {
  totals: RevenueTotals;
  breakdown: RevenueBreakdown;
  revenue_growth: MonthlyRevenuePoint[];
  orders: MonthlyOrderPoint[];
};

export type SupplierPayout = {
  supplier_id: number;
  supplier_name: string;
  orders: number;
  gross_sales: string;
  platform_revenue: string;
  supplier_payout: string;
};

export type SubscriptionUpgradePayload = {
  supplier?: number;
  plan_type: "free" | "pro" | "enterprise";
};

export type SupplierPromotionPayload = {
  supplier?: number;
  promotion_type: "featured_listing" | "homepage_promotion";
  weeks: number;
};
