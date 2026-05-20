"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, Sparkles, TimerReset, Truck } from "lucide-react";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { MiniCartPanel } from "@/components/cart/MiniCartPanel";
import { PageHeading } from "@/components/layout/PageHeading";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { ProductCatalogHeader } from "@/components/marketplace/ProductCatalogHeader";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { marketplaceApi } from "@/lib/api/marketplace";
import type { Product, Supplier } from "@/types/marketplace";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Verified supplier only",
    description: "Every order stays inside one approved supplier flow to reduce fulfillment risk."
  },
  {
    icon: Sparkles,
    title: "Simple customization",
    description: "Choose supplier labels or custom sponsor text without slowing down the order path."
  },
  {
    icon: Truck,
    title: "Delivery guidance up front",
    description: "Expected turnaround is visible before payment so there are no surprises later."
  },
  {
    icon: TimerReset,
    title: "Fastest way to order",
    description: "Browse, configure, review, and pay in one continuous funnel."
  }
];

export default function SupplierProductsPage() {
  const params = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const [supplierData, productData] = await Promise.all([
          marketplaceApi.getSupplier(params.id),
          marketplaceApi.getProductsBySupplier(params.id)
        ]);
        setSupplier(supplierData);
        setProducts(productData);
      } catch (err: any) {
        setError(err?.response?.data?.error?.detail ?? "Unable to load products for this supplier.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, [params.id]);

  const supplierName = supplier?.business_name ?? products[0]?.supplier_name ?? "Supplier catalog";

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Browse -> customize -> checkout"
        title={`${supplierName}, made easy to order.`}
        description="Select your bottle format, choose a fast supplier label or custom sticker treatment, and move into secure checkout with live pricing and delivery guidance at every step."
      />

      <ProductCatalogHeader supplier={supplier} />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-[2rem] bg-white/70 shadow-card" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Catalog unavailable" description={error} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products in this supplier catalog"
          description="This supplier has not published any water bottle listings yet."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <article key={point.title} className="bw-card p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-brand-gradient text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{point.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{point.description}</p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-6 md:grid-cols-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddedToCart={() => setIsCartDrawerOpen(true)} />
              ))}
            </div>
            <div className="xl:sticky xl:top-28 xl:self-start">
              <MiniCartPanel onOpenDrawer={() => setIsCartDrawerOpen(true)} />
            </div>
          </div>
        </>
      )}

      <CartDrawer open={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
    </section>
  );
}
