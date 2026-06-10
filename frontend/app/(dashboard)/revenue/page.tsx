"use client";

import { useEffect, useState } from "react";
import { BarChart3, Crown, IndianRupee, LineChart, PackageCheck, RefreshCw, WalletCards } from "lucide-react";

import { revenueApi } from "@/lib/api/revenue";
import type { RevenueDashboard, SupplierPayout } from "@/types/revenue";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatMoney(value?: string) {
  return money.format(Number(value ?? 0));
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date(value));
}

export default function RevenueDashboardPage() {
  const [dashboard, setDashboard] = useState<RevenueDashboard | null>(null);
  const [payouts, setPayouts] = useState<SupplierPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRevenue() {
    setIsLoading(true);
    setError("");
    try {
      const [dashboardData, payoutData] = await Promise.all([
        revenueApi.getDashboard(),
        revenueApi.getSupplierPayouts()
      ]);
      setDashboard(dashboardData);
      setPayouts(payoutData);
    } catch {
      setError("Could not load revenue data right now. Please check the backend revenue endpoints.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRevenue();
  }, []);

  const maxRevenue = Math.max(
    1,
    ...(dashboard?.revenue_growth.map((point) => Number(point.revenue)) ?? [1])
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="bw-shell overflow-hidden bg-luxe-panel p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="bw-kicker">Monetization command center</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Jal-Setu revenue dashboard
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Track platform commission, custom branding fees, subscriptions, promoted listings, supplier payouts, and the revenue levers investors will ask about first.
            </p>
          </div>
          <button className="bw-btn-secondary w-fit" type="button" onClick={loadRevenue} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={IndianRupee} label="Daily revenue" value={formatMoney(dashboard?.totals.daily)} />
        <MetricCard icon={LineChart} label="Weekly revenue" value={formatMoney(dashboard?.totals.weekly)} />
        <MetricCard icon={BarChart3} label="Monthly revenue" value={formatMoney(dashboard?.totals.monthly)} />
        <MetricCard icon={Crown} label="Yearly revenue" value={formatMoney(dashboard?.totals.yearly)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="bw-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="bw-kicker">Growth</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Revenue by month</h2>
            </div>
            <span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-semibold text-ocean">
              Last 12 months
            </span>
          </div>
          <div className="mt-8 space-y-4">
            {dashboard?.revenue_growth.length ? (
              dashboard.revenue_growth.map((point) => (
                <div key={point.month} className="grid grid-cols-[6rem_1fr_6rem] items-center gap-3 text-sm">
                  <span className="font-medium text-slate-500">{formatMonth(point.month)}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-gradient"
                      style={{ width: `${Math.max(8, (Number(point.revenue) / maxRevenue) * 100)}%` }}
                    />
                  </div>
                  <span className="text-right font-semibold text-ink">{formatMoney(point.revenue)}</span>
                </div>
              ))
            ) : (
              <EmptyState label={isLoading ? "Loading revenue growth..." : "No revenue transactions yet."} />
            )}
          </div>
        </div>

        <div className="bw-card p-6">
          <p className="bw-kicker">Breakdown</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Revenue streams</h2>
          <div className="mt-6 space-y-3">
            <BreakdownRow label="Commission" value={formatMoney(dashboard?.breakdown.commission)} />
            <BreakdownRow label="Custom branding" value={formatMoney(dashboard?.breakdown.sticker_fee)} />
            <BreakdownRow label="Subscriptions" value={formatMoney(dashboard?.breakdown.subscription)} />
            <BreakdownRow label="Promoted listings" value={formatMoney(dashboard?.breakdown.promoted_listing)} />
            <BreakdownRow label="Delivery margin" value={formatMoney(dashboard?.breakdown.delivery_margin)} />
          </div>
        </div>
      </section>

      <section className="bw-card overflow-hidden p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="bw-kicker">Supplier economics</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Payouts and platform take</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-foam px-4 py-2 text-sm font-semibold text-ocean">
            <WalletCards className="h-4 w-4" />
            Captured orders only
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th className="py-3 pr-4">Supplier</th>
                <th className="py-3 pr-4">Orders</th>
                <th className="py-3 pr-4">Gross sales</th>
                <th className="py-3 pr-4">Platform revenue</th>
                <th className="py-3">Supplier payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.length ? (
                payouts.map((payout) => (
                  <tr key={payout.supplier_id} className="text-slate-700">
                    <td className="py-4 pr-4 font-semibold text-ink">{payout.supplier_name}</td>
                    <td className="py-4 pr-4">{payout.orders}</td>
                    <td className="py-4 pr-4">{formatMoney(payout.gross_sales)}</td>
                    <td className="py-4 pr-4">{formatMoney(payout.platform_revenue)}</td>
                    <td className="py-4 font-semibold text-ocean">{formatMoney(payout.supplier_payout)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8">
                    <EmptyState label={isLoading ? "Loading supplier payouts..." : "No supplier payouts yet."} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: typeof IndianRupee;
  label: string;
  value: string;
}) {
  return (
    <div className="bw-card p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-ocean/10 p-3 text-ocean">
          <Icon className="h-5 w-5" />
        </div>
        <PackageCheck className="h-4 w-4 text-accent" />
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-5 py-6 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}
