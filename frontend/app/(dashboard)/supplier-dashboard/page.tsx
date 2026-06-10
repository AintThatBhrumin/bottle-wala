"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CircleDollarSign, PackageCheck, Plus, ShieldCheck, Store } from "lucide-react";

import { PageHeading } from "@/components/layout/PageHeading";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { marketplaceApi } from "@/lib/api/marketplace";
import { formatCurrency } from "@/lib/utils/currency";
import { useAuth } from "@/providers/AuthProvider";
import type { Order, Product, Supplier } from "@/types/marketplace";

const dashboardCards = [
  { key: "orders", label: "Incoming orders", icon: PackageCheck },
  { key: "revenue", label: "Order value", icon: CircleDollarSign },
  { key: "verified", label: "Trust signal", icon: ShieldCheck }
] as const;

function getApiError(err: any, fallback: string) {
  const error = err?.response?.data?.error;
  if (error?.fields && typeof error.fields === "object") {
    const first = Object.values(error.fields).flat()[0];
    if (first) {
      return String(first);
    }
  }
  return error?.detail ?? err?.response?.data?.detail ?? err?.message ?? fallback;
}

export default function SupplierDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Supplier | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [productMessage, setProductMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [profileForm, setProfileForm] = useState({
    business_name: "",
    location: ""
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price_per_unit: "",
    min_order_quantity: 100,
    supplier_label: true,
    custom_label: true
  });

  async function loadDashboard() {
    if (!user || user.role !== "supplier") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const incomingOrders = await marketplaceApi.getIncomingOrders();
      setOrders(incomingOrders);

      try {
        const supplierProfile = await marketplaceApi.getMySupplierProfile();
        setProfile(supplierProfile);
        setProfileForm({
          business_name: supplierProfile.business_name,
          location: supplierProfile.location
        });
        setProducts(await marketplaceApi.getMyProducts());
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setProfile(null);
          setProducts([]);
          return;
        }
        throw err;
      }
    } catch (err: any) {
      setError(getApiError(err, "Unable to load the supplier dashboard right now."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [user]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.supplier_payout || order.total_price), 0),
    [orders]
  );

  async function handleCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage("");
    setIsSavingProfile(true);

    try {
      const nextProfile = await marketplaceApi.createSupplierProfile(profileForm);
      setProfile(nextProfile);
      setProfileMessage("Supplier profile created. You can add products now.");
    } catch (err: any) {
      setProfileMessage(getApiError(err, "Could not create supplier profile."));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductMessage("");
    setIsSavingProduct(true);

    const stickerOptions = [
      productForm.supplier_label ? { type: "supplier" as const } : null,
      productForm.custom_label ? { type: "custom" as const } : null
    ].filter(Boolean) as Array<{ type: "supplier" | "custom" }>;

    if (stickerOptions.length === 0) {
      setProductMessage("Select at least one sticker option.");
      setIsSavingProduct(false);
      return;
    }

    try {
      const product = await marketplaceApi.createProduct({
        name: productForm.name,
        description: productForm.description,
        price_per_unit: productForm.price_per_unit,
        min_order_quantity: productForm.min_order_quantity,
        sticker_options: stickerOptions
      });
      setProducts((current) => [product, ...current]);
      setProductForm({
        name: "",
        description: "",
        price_per_unit: "",
        min_order_quantity: 100,
        supplier_label: true,
        custom_label: true
      });
      setProductMessage("Product added and ready in your supplier catalog.");
    } catch (err: any) {
      setProductMessage(getApiError(err, "Could not add this product."));
    } finally {
      setIsSavingProduct(false);
    }
  }

  if (authLoading) {
    return <div className="h-80 animate-pulse rounded-[2rem] bg-white/70 shadow-card" />;
  }

  if (!user || user.role !== "supplier") {
    return (
      <EmptyState
        title="Supplier dashboard unavailable"
        description="This workspace is for supplier accounts. Sign in as a supplier to manage your profile, products, and incoming orders."
      />
    );
  }

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Supplier command center"
        title="Manage demand with clarity, polish, and speed."
        description="Create your supplier profile, add bottle products, and track customer demand from one operational dashboard."
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-[2rem] bg-white/70 shadow-card" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Dashboard unavailable" description={error} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              const value =
                card.key === "orders"
                  ? String(orders.length).padStart(2, "0")
                  : card.key === "revenue"
                    ? formatCurrency(totalRevenue)
                    : profile?.is_verified
                      ? "Verified"
                      : "Pending";

              return (
                <article key={card.key} className="bw-card p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-brand-gradient text-white shadow-card">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{card.label}</p>
                  <p className="mt-3 font-serif text-4xl leading-none text-ink">{value}</p>
                </article>
              );
            })}
          </div>

          {!profile ? (
            <article className="bw-card p-6">
              <p className="bw-kicker">First setup</p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">Create your supplier profile</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Suppliers need a profile before they can add bottle products. This keeps every product tied to a verified business identity.
              </p>
              <form onSubmit={handleCreateProfile} className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Business name</span>
                  <input
                    className="bw-input"
                    value={profileForm.business_name}
                    onChange={(event) => setProfileForm((current) => ({ ...current, business_name: event.target.value }))}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Location</span>
                  <input
                    className="bw-input"
                    value={profileForm.location}
                    onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))}
                    required
                  />
                </label>
                <div className="md:col-span-2">
                  <button type="submit" className="bw-btn-primary" disabled={isSavingProfile}>
                    {isSavingProfile ? "Creating profile..." : "Create supplier profile"}
                  </button>
                  {profileMessage ? <p className="mt-3 text-sm font-medium text-ocean">{profileMessage}</p> : null}
                </div>
              </form>
            </article>
          ) : (
            <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
              <article className="bw-card p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-ocean text-white shadow-card">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean">Supplier profile</p>
                    <h3 className="mt-2 text-2xl font-semibold text-ink">{profile.business_name}</h3>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
                  <p>Location: {profile.location}</p>
                  <p>Rating: {profile.rating}</p>
                  <p>Status: {profile.is_verified ? "Verified and visible to customers" : "Awaiting admin approval"}</p>
                </div>

                <div className="mt-6 rounded-[1.3rem] bg-slate-50 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Catalog status</p>
                  <p className="mt-2 text-sm font-medium text-ink">
                    {products.length ? `${products.length} product setup${products.length === 1 ? "" : "s"} added.` : "No products added yet."}
                  </p>
                </div>
              </article>

              <article className="bw-card p-6">
                <p className="bw-kicker">Add product</p>
                <h3 className="mt-2 text-2xl font-semibold text-ink">Create a bottle listing</h3>
                <form onSubmit={handleCreateProduct} className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Product name</span>
                    <input
                      className="bw-input"
                      value={productForm.name}
                      onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Premium 500ml Event Bottle"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Price per bottle</span>
                    <input
                      className="bw-input"
                      type="number"
                      min="1"
                      step="0.01"
                      value={productForm.price_per_unit}
                      onChange={(event) => setProductForm((current) => ({ ...current, price_per_unit: event.target.value }))}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Minimum quantity</span>
                    <input
                      className="bw-input"
                      type="number"
                      min="1"
                      value={productForm.min_order_quantity}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, min_order_quantity: Number(event.target.value) }))
                      }
                      required
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
                    <textarea
                      className="bw-input min-h-24"
                      value={productForm.description}
                      onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Best for conferences, weddings, and sponsor-led events."
                    />
                  </label>
                  <div className="grid gap-3 md:col-span-2 sm:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={productForm.supplier_label}
                        onChange={(event) => setProductForm((current) => ({ ...current, supplier_label: event.target.checked }))}
                      />
                      Supplier label available
                    </label>
                    <label className="flex items-center gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={productForm.custom_label}
                        onChange={(event) => setProductForm((current) => ({ ...current, custom_label: event.target.checked }))}
                      />
                      Custom branding available
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="bw-btn-primary" disabled={isSavingProduct}>
                      <Plus className="h-4 w-4" />
                      {isSavingProduct ? "Adding product..." : "Add product"}
                    </button>
                    {productMessage ? <p className="mt-3 text-sm font-medium text-ocean">{productMessage}</p> : null}
                  </div>
                </form>
              </article>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            <article className="bw-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean">Your catalog</p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">Products customers can order</h3>
              <div className="mt-5 space-y-3">
                {products.length === 0 ? (
                  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-5 text-sm text-slate-600">
                    Add your first bottle listing from the form above.
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-ink">{product.name}</p>
                          <p className="mt-1 text-sm text-slate-500">Minimum {product.min_order_quantity} units</p>
                        </div>
                        <p className="text-sm font-semibold text-ocean">{formatCurrency(Number(product.price_per_unit))}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="bw-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean">Incoming orders</p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">Orders needing attention</h3>
              <div className="mt-5 space-y-3">
                {orders.length === 0 ? (
                  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-5 text-sm text-slate-600">
                    No incoming orders yet. Paid customer orders will appear here.
                  </div>
                ) : (
                  orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-ink">Order #{order.id}</p>
                          <p className="mt-1 text-sm text-slate-500">{order.delivery_address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold capitalize text-ocean">{order.status}</p>
                          <p className="mt-1 text-sm text-slate-500">{formatCurrency(Number(order.total_price))}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
