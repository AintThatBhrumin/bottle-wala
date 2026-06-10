import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { appConfig } from "@/lib/constants/domain";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  alternates: {
    canonical: appConfig.siteUrl
  }
};

const trustSignals = [
  "Verified suppliers with event-ready fulfillment",
  "Live sticker customization with real-time pricing",
  "Secure payment and delivery confidence before checkout"
];

const flowSteps = [
  {
    step: "01",
    title: "Browse trusted suppliers",
    description: "Compare verified partners by location, rating, and fulfillment fit."
  },
  {
    step: "02",
    title: "Customize bottles quickly",
    description: "Choose quantity, pick supplier or custom stickers, and watch pricing update in real time."
  },
  {
    step: "03",
    title: "Checkout with confidence",
    description: "Use a minimal form, secure payment, and clear order tracking after confirmation."
  }
];

const momentumMetrics = [
  { value: "5-7 days", label: "Typical delivery estimate" },
  { value: "2 min", label: "Average checkout path" },
  { value: "4.9/5", label: "Supplier trust rating" }
];

export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="bw-shell bw-subtle-grid px-6 py-10 sm:px-8 sm:py-12">
          <div className="absolute -right-16 top-2 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-ocean/14 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="bw-fade-up">
              <BrandLogo priority="hero" showTagline className="max-w-max" />
              <h1 className="mt-5 max-w-3xl font-serif text-6xl leading-[0.9] text-ink sm:text-7xl">
                Water bottle ordering that feels like a premium startup product.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Move from supplier discovery to branded bottle checkout in one clean flow built for launches,
                weddings, gifting, hospitality, and high-velocity event teams.
              </p>
            </div>

            <div className="bw-fade-up-delay mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={routes.suppliers} className="bw-btn-primary">
                Start ordering now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={routes.register} className="bw-btn-secondary">
                Create free account
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {trustSignals.map((signal) => (
                <div key={signal} className="rounded-[1.5rem] bg-white/82 px-4 py-4 shadow-card">
                  <p className="text-sm leading-6 text-slate-600">{signal}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {momentumMetrics.map((metric) => (
                <div key={metric.label} className="bw-metric">
                  <p className="text-3xl font-semibold text-ink">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <article className="bw-card bw-float p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-brand-gradient text-white shadow-card">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="bw-pill bg-emerald-50 text-emerald-700">Trust-first sourcing</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Verified suppliers only</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Every customer starts from a vetted supplier list, which reduces hesitation from the very first click.
            </p>
          </article>

          <article className="bw-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-white text-accent shadow-card">
                <Truck className="h-5 w-5" />
              </div>
              <span className="bw-pill bg-sky-50 text-sky-700">Delivery clarity</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Know the timeline before you pay</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Delivery estimates and fulfillment cues appear early, so customers move forward with confidence.
            </p>
          </article>

          <article className="bw-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-white text-brass shadow-card">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="bw-pill bg-amber-50 text-amber-700">Custom branding</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Personalized without slowing checkout</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Customers can choose quick supplier stickers or custom branded artwork without breaking the flow.
            </p>
          </article>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {flowSteps.map((item) => (
          <article key={item.step} className="bw-card p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ocean">{item.step}</p>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>

      <div className="bw-shell px-6 py-6 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="bw-kicker">Why teams choose Jal-Setu</p>
            <h2 className="mt-3 max-w-xl font-serif text-4xl leading-tight text-ink sm:text-5xl">
              Built to reduce drop-off between product discovery and checkout.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.6rem] bg-white/86 px-4 py-4 shadow-card">
              <BadgeCheck className="h-5 w-5 text-ocean" />
              <p className="mt-3 text-sm font-medium text-ink">Verified listings only</p>
            </div>
            <div className="rounded-[1.6rem] bg-white/86 px-4 py-4 shadow-card">
              <Sparkles className="h-5 w-5 text-accent" />
              <p className="mt-3 text-sm font-medium text-ink">Live customization feedback</p>
            </div>
            <div className="rounded-[1.6rem] bg-white/86 px-4 py-4 shadow-card">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-medium text-ink">Secure payment confirmation</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
