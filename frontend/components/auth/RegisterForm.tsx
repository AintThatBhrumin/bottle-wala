"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { routes } from "@/lib/constants/routes";
import { useAuth } from "@/providers/AuthProvider";

export function RegisterForm() {
  const router = useRouter();
  const { register, defaultRouteForRole } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "customer" as "customer" | "supplier",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await register(form);
      router.push(defaultRouteForRole(user.role));
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.error?.detail ?? "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
        <input
          type="text"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="bw-input"
          placeholder="Aarav Mehta"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="bw-input"
          placeholder="hello@company.com"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Account type</span>
        <select
          value={form.role}
          onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as "customer" | "supplier" }))}
          className="bw-input"
        >
          <option value="customer">Customer</option>
          <option value="supplier">Supplier</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          className="bw-input"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </label>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <div className="rounded-[1.3rem] bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Choose customer if you want to place orders now. Choose supplier if you want to list products and receive
        approval before going live.
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bw-btn-primary w-full disabled:opacity-60"
      >
        {isSubmitting ? "Creating your account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href={routes.login} className="font-semibold text-ocean">
          Login
        </Link>
      </p>
    </form>
  );
}
