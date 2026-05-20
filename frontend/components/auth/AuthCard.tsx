import type { PropsWithChildren } from "react";

type AuthCardProps = PropsWithChildren<{
  title: string;
  description: string;
  benefits: string[];
  badge: string;
}>;

export function AuthCard({ title, description, benefits, badge, children }: AuthCardProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="bw-shell bw-subtle-grid px-6 py-8 sm:px-8">
        <div className="absolute -right-14 top-0 h-44 w-44 rounded-full bg-accent/16 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-ocean/14 blur-3xl" />

        <div className="relative">
          <p className="bw-pill bg-ocean/10 text-ocean">{badge}</p>
          <h2 className="mt-5 font-serif text-5xl leading-[0.94] text-ink sm:text-6xl">{title}</h2>
          <p className="mt-4 max-w-md text-base leading-8 text-slate-600">{description}</p>

          <div className="mt-8 space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-[1.4rem] bg-white/82 px-4 py-4 shadow-card">
                <p className="text-sm leading-6 text-slate-600">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/80 bg-white/94 p-8 shadow-luxe sm:p-10">
        <p className="bw-kicker">Secure access</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Continue with confidence</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your account unlocks verified suppliers, real-time bottle customization, and tracked order management in one
          premium workflow.
        </p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
