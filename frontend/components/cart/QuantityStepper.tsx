"use client";

type QuantityStepperProps = {
  value: number;
  min: number;
  onChange: (value: number) => void;
};

export function QuantityStepper({ value, min, onChange }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-11 w-11 rounded-full text-lg font-semibold text-slate-600 hover:bg-slate-50"
      >
        -
      </button>
      <div className="min-w-16 text-center text-sm font-semibold text-ink">{value}</div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-11 w-11 rounded-full text-lg font-semibold text-slate-600 hover:bg-slate-50"
      >
        +
      </button>
    </div>
  );
}
