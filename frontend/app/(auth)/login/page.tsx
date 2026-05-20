import { Suspense } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[76vh] items-center justify-center">
      <AuthCard
        title="Welcome back"
        description="Sign in to browse trusted suppliers, customize bottles quickly, and complete event orders in a checkout flow designed to feel calm and premium."
        badge="Return to your workspace"
        benefits={[
          "Verified suppliers and clear fulfillment cues before you commit.",
          "Real-time pricing while you choose quantity and sticker style.",
          "Secure payment, clear delivery expectations, and live order tracking."
        ]}
      >
        <Suspense fallback={<div className="text-sm text-slate-500">Loading sign-in form...</div>}>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
