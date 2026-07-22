import { formatCurrency, formatDeliveryDate } from "../lib/format.js";
import { AlternativeCard } from "./AlternativeCard.jsx";
import { PriceLine } from "./PriceLine.jsx";

export function ConfidenceResult({ error, loading, result, selectedSizeLabel }) {
  return (
    <div className="mt-6 min-h-32" aria-live="polite">
      {!loading && !error && !result && (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
          Choose a size to check availability, final price, and delivery confidence.
        </div>
      )}

      {loading && (
        <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Checking stock, price, and delivery promise...
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {error}
        </div>
      )}

      {result?.status === "available" && <AvailableResult result={result} />}
      {result?.status === "out_of_stock" && (
        <UnavailableResult result={result} selectedSizeLabel={selectedSizeLabel} />
      )}
    </div>
  );
}

function AvailableResult({ result }) {
  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5">
      <p className="font-semibold text-emerald-900">{result.message}</p>
      <p className="mt-1 text-sm text-emerald-800">
        Guaranteed delivery by {formatDeliveryDate(result.delivery_days)}
      </p>

      <div className="mt-4 grid gap-2 text-sm text-emerald-950">
        <PriceLine label="Base price" value={result.price.base_price} />
        <PriceLine label="Stitching fee" value={result.price.stitching_fee} />
        <PriceLine label="Shipping fee" value={result.price.shipping_fee} />
        <div className="mt-2 flex items-center justify-between border-t border-emerald-200 pt-3 text-base font-bold">
          <span>Total</span>
          <span>{formatCurrency(result.price.total)}</span>
        </div>
      </div>
    </div>
  );
}

function UnavailableResult({ result, selectedSizeLabel }) {
  return (
    <div>
      <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
        <p className="font-semibold text-amber-950">
          Out of stock in {selectedSizeLabel}
        </p>
        <p className="mt-1 text-sm text-amber-900">{result.message}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-800">
          Similar options available now
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {result.alternatives.map((alternative) => (
            <AlternativeCard key={alternative.id} alternative={alternative} />
          ))}
        </div>
      </div>
    </div>
  );
}
