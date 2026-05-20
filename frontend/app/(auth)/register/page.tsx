import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[76vh] items-center justify-center">
      <AuthCard
        title="Create your account"
        description="Join as a customer to start ordering fast, or as a supplier to launch a polished bottle catalog customers can trust right away."
        badge="Start with Jal-Setu"
        benefits={[
          "A smoother browse to checkout path for event teams and operations leads.",
          "Custom sticker support for launches, weddings, gifting, and hospitality orders.",
          "Production-ready account setup with order history, trust signals, and secure checkout."
        ]}
      >
        <RegisterForm />
      </AuthCard>
    </div>
  );
}
