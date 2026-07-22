import { formatCurrency } from "../lib/format.js";

export function AlternativeCard({ alternative }) {
  return (
    <a
      href={`#alternative-${alternative.id}`}
      className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-200"
    >
      <img
        src={alternative.image_url}
        alt={alternative.name}
        className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-semibold text-slate-950">
          {alternative.name}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {formatCurrency(alternative.price)}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {alternative.delivery_days} day delivery
        </p>
      </div>
    </a>
  );
}
