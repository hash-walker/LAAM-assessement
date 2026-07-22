import { formatCurrency } from "../lib/format.js";

export function PriceLine({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
