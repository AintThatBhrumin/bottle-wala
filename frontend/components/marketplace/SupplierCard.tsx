import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Star } from "lucide-react";

import type { Supplier } from "@/types/marketplace";

type SupplierCardProps = {
  supplier: Supplier;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/75 bg-white/86 shadow-luxe backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(30,58,138,0.16)]">
      <div className="relative overflow-hidden bg-slate-950 px-6 pb-8 pt-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.28),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.34),transparent_34%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-100">
              Trusted supplier
              {supplier.is_verified ? <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" /> : null}
            </div>
            <div>
              <h3 className="max-w-[12rem] font-serif text-4xl leading-none text-ivory">{supplier.business_name}</h3>
              <p className="mt-3 max-w-[14rem] text-sm leading-6 text-slate-300">
                Event-ready bottle programs with strong delivery coordination and premium branding support.
              </p>
            </div>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/15 bg-white/10 text-lg font-semibold tracking-[0.08em] text-white">
            {getInitials(supplier.business_name) || "BW"}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
            <MapPin className="h-4 w-4 text-accent" />
            {supplier.location}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
            <Star className="h-4 w-4 fill-current" />
            {supplier.rating} rating
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Lead time</p>
            <p className="mt-1 text-sm font-medium text-ink">5 to 7 days</p>
          </div>
          <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Best for</p>
            <p className="mt-1 text-sm font-medium text-ink">Events</p>
          </div>
          <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Trust</p>
            <p className="mt-1 text-sm font-medium text-ink">{supplier.is_verified ? "Verified" : "Pending"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-slate-400">Customers use this supplier for</p>
            <p className="mt-1 text-sm font-medium text-slate-700">Launch kits, gifting drops, hospitality hydration</p>
          </div>

          <Link
            href={`/suppliers/${supplier.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-medium text-white shadow-card"
          >
            Explore catalog
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
