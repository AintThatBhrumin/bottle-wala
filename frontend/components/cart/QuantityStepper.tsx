"use client";

import { useEffect, useState } from "react";

type QuantityStepperProps = {
  value: number;
  min: number;
  onChange: (value: number) => void;
};

export function QuantityStepper({ value, min, onChange }: QuantityStepperProps) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  function commitValue(nextValue: string) {
    const parsed = Number.parseInt(nextValue, 10);
    if (Number.isNaN(parsed)) {
      setDraftValue(String(value));
      return;
    }

    const normalized = Math.max(min, parsed);
    setDraftValue(String(normalized));
    onChange(normalized);
  }

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-11 w-11 rounded-full text-lg font-semibold text-slate-600 hover:bg-slate-50"
      >
        -
      </button>
      <input
        type="number"
        min={min}
        inputMode="numeric"
        value={draftValue}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraftValue(nextValue);

          const parsed = Number.parseInt(nextValue, 10);
          if (!Number.isNaN(parsed) && parsed >= min) {
            onChange(parsed);
          }
        }}
        onBlur={() => commitValue(draftValue)}
        className="h-11 w-24 border-x border-slate-100 bg-transparent px-2 text-center text-sm font-semibold text-ink outline-none"
        aria-label="Quantity"
      />
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
