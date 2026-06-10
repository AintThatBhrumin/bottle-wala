"use client";

import { apiClient } from "@/lib/api/client";
import type {
  CartItem,
  Order,
  OrderCheckoutSession,
  PaginatedResponse,
  Product,
  Supplier
} from "@/types/marketplace";

export type CheckoutPayload = {
  delivery_address: string;
  items: CartItem[];
};

export type SupplierProfilePayload = {
  business_name: string;
  location: string;
};

export type ProductPayload = {
  name: string;
  description: string;
  price_per_unit: string;
  min_order_quantity: number;
  sticker_options: Array<{
    type: "supplier" | "custom";
  }>;
};

export type PaymentVerificationPayload = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type PaymentFailurePayload = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
};

function buildOrderItem(item: CartItem) {
  const formFriendly = {
    product: item.productId,
    quantity: item.quantity,
    sticker_type: item.stickerType,
    custom_text: item.stickerType === "custom" ? item.customText : ""
  };

  return formFriendly;
}

export const marketplaceApi = {
  async getSuppliers() {
    const response = await apiClient.get<PaginatedResponse<Supplier>>("/proxy/suppliers/");
    return response.data.results;
  },
  async getSupplier(supplierId: string) {
    const response = await apiClient.get<Supplier>(`/proxy/suppliers/${supplierId}/`);
    return response.data;
  },
  async getProductsBySupplier(supplierId: string) {
    const response = await apiClient.get<PaginatedResponse<Product>>(`/proxy/products/?supplier=${supplierId}`);
    return response.data.results;
  },
  async startOrderCheckout(payload: CheckoutPayload) {
    const hasFiles = payload.items.some((item) => item.customImage);

    if (!hasFiles) {
      const response = await apiClient.post<OrderCheckoutSession>("/proxy/orders/", {
        delivery_address: payload.delivery_address,
        items: payload.items.map(buildOrderItem)
      });
      return response.data;
    }

    const formData = new FormData();
    formData.append("delivery_address", payload.delivery_address);

    payload.items.forEach((item, index) => {
      formData.append(`items[${index}][product]`, String(item.productId));
      formData.append(`items[${index}][quantity]`, String(item.quantity));
      formData.append(`items[${index}][sticker_type]`, item.stickerType);
      formData.append(`items[${index}][custom_text]`, item.stickerType === "custom" ? item.customText : "");
      if (item.stickerType === "custom" && item.customImage) {
        formData.append(`items[${index}][custom_image]`, item.customImage);
      }
    });

    const response = await apiClient.post<OrderCheckoutSession>("/proxy/orders/", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  },
  async verifyOrderPayment(orderId: number, payload: PaymentVerificationPayload) {
    const response = await apiClient.post<Order>(`/proxy/orders/${orderId}/verify-payment/`, payload);
    return response.data;
  },
  async reportOrderPaymentFailure(orderId: number, payload: PaymentFailurePayload) {
    const response = await apiClient.post<Order>(`/proxy/orders/${orderId}/payment-failed/`, payload);
    return response.data;
  },
  async getOrders() {
    const response = await apiClient.get<PaginatedResponse<Order> | Order[]>("/proxy/orders/history/");
    return Array.isArray(response.data) ? response.data : response.data.results;
  },
  async getIncomingOrders() {
    const response = await apiClient.get<PaginatedResponse<Order> | Order[]>("/proxy/orders/incoming/");
    return Array.isArray(response.data) ? response.data : response.data.results;
  },
  async getMySupplierProfile() {
    const response = await apiClient.get<Supplier>("/proxy/suppliers/mine/");
    return response.data;
  },
  async createSupplierProfile(payload: SupplierProfilePayload) {
    const response = await apiClient.post<Supplier>("/proxy/suppliers/", payload);
    return response.data;
  },
  async getMyProducts() {
    const response = await apiClient.get<PaginatedResponse<Product> | Product[]>("/proxy/products/mine/");
    return Array.isArray(response.data) ? response.data : response.data.results;
  },
  async createProduct(payload: ProductPayload) {
    const response = await apiClient.post<Product>("/proxy/products/", payload);
    return response.data;
  }
};
