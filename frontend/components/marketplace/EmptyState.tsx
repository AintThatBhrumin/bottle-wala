import { Compass } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="bw-shell px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-card">
        <Compass className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-serif text-4xl leading-none text-ink">{title}</h3>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}
