"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { routes } from "@/lib/constants/routes";
import { useAuth } from "@/providers/AuthProvider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, defaultRouteForRole } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(form);
      router.push(searchParams.get("next") ?? defaultRouteForRole(user.role));
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.error?.detail ?? "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="bw-input"
          placeholder="events@company.com"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          className="bw-input"
          placeholder="********"
          required
        />
      </label>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <div className="rounded-[1.3rem] bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Friendly note: once you sign in, you land directly in the supplier marketplace so you can keep momentum.
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bw-btn-primary w-full disabled:opacity-60"
      >
        {isSubmitting ? "Signing you in..." : "Continue to suppliers"}
      </button>

      <p className="text-center text-sm text-slate-600">
        New here?{" "}
        <Link href={routes.register} className="font-semibold text-ocean">
          Create an account
        </Link>
      </p>
    </form>
  );
}
