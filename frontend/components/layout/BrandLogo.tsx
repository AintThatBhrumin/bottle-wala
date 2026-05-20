"use client";

import Link from "next/link";
import { useState } from "react";

import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type BrandLogoProps = {
  className?: string;
  href?: string;
  priority?: "hero" | "header";
  showTagline?: boolean;
};

const logoSrc = "/brand/jal-setu-logo.png";

export function BrandLogo({
  className,
  href = routes.home,
  priority = "header",
  showTagline = false
}: BrandLogoProps) {
  const [imageMissing, setImageMissing] = useState(false);

  const logoWidth = priority === "hero" ? "w-[15rem] sm:w-[22rem]" : "w-[10.5rem] sm:w-[14rem]";
  const fallbackText = priority === "hero" ? "text-[2rem] sm:text-[3rem]" : "text-[1.5rem] sm:text-[2rem]";
  const taglineSpacing = priority === "hero" ? "mt-3" : "mt-2";

  const wordmark = (
    <div className={cn("inline-flex flex-col", className)}>
      {!imageMissing ? (
        <img
          src={logoSrc}
          alt="JAL-SETU"
          className={cn("h-auto object-contain", logoWidth)}
          onError={() => setImageMissing(true)}
        />
      ) : (
        <div
          className={cn(
            "font-sans font-black uppercase leading-none tracking-[-0.08em] text-ink",
            fallbackText
          )}
        >
          JAL-SETU
        </div>
      )}

      {showTagline ? (
        <p
          className={cn(
            taglineSpacing,
            "pl-1 text-[0.64rem] font-semibold uppercase tracking-[0.38em] text-slate-500 sm:text-[0.7rem]"
          )}
        >
          Fluid Premium Commerce
        </p>
      ) : null}
    </div>
  );

  return (
    <Link href={href} className="inline-flex max-w-full items-center">
      <span className="sr-only">JAL-SETU home</span>
      {wordmark}
    </Link>
  );
}
