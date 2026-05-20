type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeading({ eyebrow, title, description }: PageHeadingProps) {
  return (
    <div className="bw-shell bw-subtle-grid px-6 py-8 sm:px-8 sm:py-10">
      <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-ocean/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent/12 blur-3xl" />
      <div className="relative max-w-5xl">
        <div className="bw-fade-up">
          <p className="bw-kicker mb-4">{eyebrow}</p>
          <h2 className="max-w-4xl font-serif text-5xl leading-[0.95] text-ink sm:text-6xl">{title}</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
        </div>

        <div className="bw-fade-up-delay mt-6 flex flex-wrap gap-3">
          <span className="bw-pill bg-white/85 text-slate-600 shadow-card">Verified suppliers</span>
          <span className="bw-pill bg-white/85 text-slate-600 shadow-card">Secure checkout</span>
          <span className="bw-pill bg-white/85 text-slate-600 shadow-card">Fast event ordering</span>
        </div>
      </div>
    </div>
  );
}
