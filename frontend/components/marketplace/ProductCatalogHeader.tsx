import { MapPin, Star } from "lucide-react";

import type { Supplier } from "@/types/marketplace";

type ProductCatalogHeaderProps = {
  supplier: Supplier | null;
};

export function ProductCatalogHeader({ supplier }: ProductCatalogHeaderProps) {
  if (!supplier) {
    return null;
  }

  return (
    <div className="bw-shell mb-8 px-6 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="bw-kicker">Verified supplier</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">{supplier.business_name}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              {supplier.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              {supplier.rating} rating
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-foam px-4 py-3 text-sm font-medium text-ocean">
          Single-supplier checkout keeps approvals and fulfillment faster.
        </div>
      </div>
    </div>
  );
}
