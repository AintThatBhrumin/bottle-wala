"use client";

import { Search } from "lucide-react";

type SupplierFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  totalSuppliers: number;
  totalLocations: number;
  averageRating: string;
};

export function SupplierFilters({
  search,
  onSearchChange,
  totalSuppliers,
  totalLocations,
  averageRating
}: SupplierFiltersProps) {
  const highlights = [
    { label: "Verified houses", value: String(totalSuppliers).padStart(2, "0") },
    { label: "Cities covered", value: String(totalLocations).padStart(2, "0") },
    { label: "Average rating", value: averageRating }
  ];

  return (
    <div className="bw-shell grid gap-5 p-5 md:grid-cols-[1.25fr_0.95fr] md:p-6">
      <div className="space-y-4">
        <div>
          <p className="bw-kicker">Search with confidence</p>
          <h3 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-ink">
            Find the right supplier by city, venue market, or business name and move into ordering without friction.
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Each result is optimized for quick scanning, so you can shortlist a trusted partner and start customizing
            bottles fast.
          </p>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search trusted suppliers or locations"
            className="bw-input pl-12 pr-4"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
        {highlights.map((highlight) => (
          <div key={highlight.label} className="rounded-[1.5rem] bg-slate-950 px-4 py-4 text-ivory shadow-card">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-slate-400">{highlight.label}</p>
            <p className="mt-3 font-serif text-4xl leading-none text-white">{highlight.value}</p>
            <div className="mt-4 h-1.5 w-16 rounded-full bg-brand-gradient" />
          </div>
        ))}
      </div>
    </div>
  );
}
