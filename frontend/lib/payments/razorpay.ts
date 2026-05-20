"use client";

import type { OrderCheckoutSession } from "@/types/marketplace";

type RazorpaySuccessPayload = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailurePayload = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  notes?: Record<string, string>;
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpaySuccessPayload) => void;
};

type RazorpayCheckoutInstance = {
  open: () => void;
  on: (eventName: "payment.failed", handler: (response: RazorpayFailurePayload) => void) => void;
};

type RazorpayWindow = Window & {
  Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
};

type OpenCheckoutParams = {
  session: OrderCheckoutSession;
  onSuccess: (payload: RazorpaySuccessPayload) => Promise<void> | void;
  onFailure: (payload: RazorpayFailurePayload) => Promise<void> | void;
  onDismiss?: () => void;
};

let razorpayScriptPromise: Promise<void> | null = null;

export async function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    throw new Error("Razorpay checkout can only be loaded in the browser.");
  }

  if ((window as RazorpayWindow).Razorpay) {
    return;
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        razorpayScriptPromise = null;
        reject(new Error("Unable to load Razorpay checkout."));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export async function openRazorpayCheckout({
  session,
  onSuccess,
  onFailure,
  onDismiss
}: OpenCheckoutParams) {
  await loadRazorpayCheckoutScript();

  const Razorpay = (window as RazorpayWindow).Razorpay;
  if (!Razorpay) {
    throw new Error("Razorpay checkout is unavailable.");
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const checkout = new Razorpay({
      ...session.payment,
      modal: {
        ondismiss: () => {
          if (settled) {
            return;
          }
          settled = true;
          onDismiss?.();
          resolve();
        }
      },
      handler: async (response) => {
        if (settled) {
          return;
        }
        settled = true;
        try {
          await onSuccess(response);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });

    checkout.on("payment.failed", async (response) => {
      if (settled) {
        return;
      }
      settled = true;
      try {
        await onFailure(response);
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    checkout.open();
  });
}
