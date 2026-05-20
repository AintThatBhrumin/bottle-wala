"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { PageHeading } from "@/components/layout/PageHeading";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { SupplierFilters } from "@/components/marketplace/SupplierFilters";
import { SupplierCard } from "@/components/marketplace/SupplierCard";
import { marketplaceApi } from "@/lib/api/marketplace";
import type { Supplier } from "@/types/marketplace";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const data = await marketplaceApi.getSuppliers();
        setSuppliers(data);
      } catch (err: any) {
        setError(err?.response?.data?.error?.detail ?? "Unable to load suppliers right now.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return suppliers;
    }

    return suppliers.filter((supplier) =>
      [supplier.business_name, supplier.location, supplier.user_name].some((value) => value.toLowerCase().includes(query))
    );
  }, [deferredSearch, suppliers]);

  const totalLocations = useMemo(() => new Set(suppliers.map((supplier) => supplier.location.trim())).size, [suppliers]);
  const averageRating = useMemo(() => {
    if (suppliers.length === 0) {
      return "0.0";
    }

    const total = suppliers.reduce((sum, supplier) => sum + Number(supplier.rating), 0);
    return (total / suppliers.length).toFixed(1);
  }, [suppliers]);

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Supplier network"
        title="Choose a trusted supplier, then move into customization without second-guessing."
        description="Browse verified partners with clear ratings, location context, and event-ready capabilities so the path from discovery to order feels fast, premium, and dependable."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <article className="bw-card p-5">
          <p className="bw-kicker">Low-friction discovery</p>
          <h3 className="mt-3 text-xl font-semibold text-ink">Shortlist quickly</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ratings, cities, and trust cues are surfaced up front so customers can choose confidently.
          </p>
        </article>
        <article className="bw-card p-5">
          <p className="bw-kicker">Social proof</p>
          <h3 className="mt-3 text-xl font-semibold text-ink">High-conviction supplier cards</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Every card is built to reduce decision fatigue and keep customers progressing toward product selection.
          </p>
        </article>
        <article className="bw-card p-5">
          <p className="bw-kicker">Conversion path</p>
          <h3 className="mt-3 text-xl font-semibold text-ink">Browse to order in minutes</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Once a supplier feels right, the next page takes customers directly into quantity, branding, and checkout.
          </p>
        </article>
      </div>

      <SupplierFilters
        search={search}
        onSearchChange={setSearch}
        totalSuppliers={suppliers.length}
        totalLocations={totalLocations}
        averageRating={averageRating}
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[24rem] animate-pulse rounded-[2rem] bg-white/65 shadow-card" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Supplier list unavailable" description={error} />
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No supplier matches yet"
          description="Try another city or supplier name. As more verified partners are approved, this page becomes your fastest route into bottle customization and checkout."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      )}
    </section>
  );
}
