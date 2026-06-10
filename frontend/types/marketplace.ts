export type Supplier = {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  business_name: string;
  location: string;
  rating: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type StickerOption = {
  id: number;
  type: "supplier" | "custom";
  template_image?: string | null;
  created_at: string;
};

export type Product = {
  id: number;
  supplier: number;
  supplier_name: string;
  name: string;
  description: string;
  price_per_unit: string;
  min_order_quantity: number;
  image?: string | null;
  sticker_options: StickerOption[];
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  lineId: string;
  productId: number;
  supplierId: number;
  name: string;
  supplierName: string;
  pricePerUnit: number;
  customStickerFeePerBottle?: number;
  minOrderQuantity: number;
  quantity: number;
  stickerType: "supplier" | "custom";
  customText: string;
  customImage?: File | null;
  image?: string | null;
};

export type OrderItem = {
  id: number;
  product: Product;
  quantity: number;
  sticker_type: "supplier" | "custom";
  custom_text: string;
  custom_image?: string | null;
  unit_price_snapshot: string;
  line_total: string;
  created_at: string;
};

export type Order = {
  id: number;
  user: number;
  user_email: string;
  supplier: Pick<Supplier, "id" | "business_name" | "location" | "is_verified"> | null;
  total_price: string;
  subtotal_price: string;
  customization_total: string;
  delivery_cost: string;
  commission_percentage_snapshot: string;
  commission_revenue: string;
  delivery_margin_revenue: string;
  platform_revenue: string;
  supplier_payout: string;
  status: "payment_pending" | "pending" | "accepted" | "delivered" | "cancelled";
  payment_status: "created" | "authorized" | "captured" | "failed" | "refunded";
  currency: string;
  delivery_address: string;
  items: OrderItem[];
  payment_captured_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderCheckoutPayment = {
  provider: "razorpay" | "demo";
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
  };
  notes: Record<string, string>;
};

export type OrderCheckoutSession = {
  order: Order;
  payment: OrderCheckoutPayment;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
