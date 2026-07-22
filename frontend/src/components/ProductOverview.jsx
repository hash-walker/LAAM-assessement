import { formatCurrency } from "../lib/format.js";

export function ProductOverview({ product }) {
  return (
    <aside className="space-y-5">
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-[4/5] h-full w-full object-cover"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {product.highlights.map((highlight) => (
          <div
            key={highlight.label}
            className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"
          >
            <p className="font-semibold text-slate-950">{highlight.value}</p>
            <p className="mt-1 text-xs text-slate-500">{highlight.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Starting price</p>
        <p className="mt-1 text-2xl font-semibold text-slate-950">
          {formatCurrency(product.price)}
        </p>
      </div>
    </aside>
  );
}
