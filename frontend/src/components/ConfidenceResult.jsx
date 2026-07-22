import { useState } from "react";
import { formatCurrency, formatDeliveryDate } from "../lib/format.js";
import { AlternativeCard } from "./AlternativeCard.jsx";

export function ConfidenceResult({ error, loading, result, selectedSize, onProductSelect }) {
  // Nothing shown until the customer interacts
  if (!selectedSize && !loading && !error && !result) return null;

  return (
    <div className="mt-6" aria-live="polite" aria-atomic="true">
      {loading && <SkeletonLoader />}

      {error && !loading && (
        <p className="text-sm mt-1" style={{ color: "#a0241f" }}>
          {error}
        </p>
      )}

      {!loading && result?.status === "available" && (
        <AvailableResult result={result} onProductSelect={onProductSelect} />
      )}

      {!loading && result?.status === "out_of_stock" && (
        <UnavailableResult result={result} selectedSize={selectedSize} onProductSelect={onProductSelect} />
      )}
    </div>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────── */
function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-3 mt-2" aria-label="Loading">
      <div className="skeleton h-3 w-24 rounded" />
      <div
        className="mt-1 p-4 flex flex-col gap-3"
        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <div className="flex justify-between">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-16" />
        </div>
        <div className="flex justify-between">
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-3 w-14" />
        </div>
        <div
          className="flex justify-between pt-3 mt-1"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="skeleton h-4 w-10" />
          <div className="skeleton h-4 w-20" />
        </div>
      </div>
      <div className="skeleton h-11 w-full mt-1" />
    </div>
  );
}

/* ── Available state ──────────────────────────────────────────── */
function AvailableResult({ result, onProductSelect }) {
  const [isAdded, setIsAdded] = useState(false);

  function handleAddToBag() {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  }

  return (
    <div className="animate-fade-slide-up">
      {/* Inline stock indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "#22c55e" }}
          aria-hidden="true"
        />
        <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          In stock
        </span>
      </div>

      {/* Price breakdown — revealed only after size selection */}
      <div
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "1rem 1.25rem",
          marginBottom: "1rem",
        }}
      >
        <p
          className="text-[10px] font-medium uppercase tracking-[0.18em] mb-3"
          style={{ color: "var(--muted)" }}
        >
          Order Summary
        </p>

        <div className="flex flex-col gap-2 text-sm">
          {/* Base price */}
          <div className="flex items-center justify-between">
            <span style={{ color: "var(--muted)" }}>Base price</span>
            <span style={{ color: "var(--ink)" }}>
              {formatCurrency(result.price.base_price)}
            </span>
          </div>

          {/* Stitching — only shown when applicable */}
          {result.price.stitching_fee > 0 && (
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--muted)" }}>Stitching</span>
              <span style={{ color: "var(--ink)" }}>
                {formatCurrency(result.price.stitching_fee)}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex items-center justify-between">
            <span style={{ color: "var(--muted)" }}>Shipping</span>
            <span style={{ color: "var(--ink)" }}>
              {formatCurrency(result.price.shipping_fee)}
            </span>
          </div>

          {/* Total */}
          <div
            className="flex items-center justify-between pt-3 mt-1 font-semibold"
            style={{
              borderTop: "1px solid var(--border)",
              fontSize: "1rem",
              color: "var(--ink)",
            }}
          >
            <span>Total</span>
            <span>{formatCurrency(result.price.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery estimate */}
      <p className="text-[13px] mb-5" style={{ color: "var(--muted)" }}>
        Estimated delivery by{" "}
        <span style={{ color: "var(--ink)", fontWeight: 500 }}>
          {formatDeliveryDate(result.delivery_days)}
        </span>
      </p>

      {/* Add to Bag CTA */}
      <button
        id="add-to-bag-btn"
        onClick={handleAddToBag}
        className="w-full h-12 text-[12px] font-medium tracking-[0.18em] uppercase transition-all duration-200"
        style={{
          background: isAdded ? "#2d6a4f" : "var(--ink)",
          color: "white",
          border: "none",
          outline: "none",
          cursor: "pointer",
          borderRadius: 0,
        }}
        aria-label={isAdded ? "Item added to bag" : "Add to bag"}
      >
        {isAdded ? "Added to Bag ✓" : "Add to Bag"}
      </button>

      {/* Supplementary shelf — faster or cheaper alternatives, shown BELOW the CTA.
           Placement is deliberate: primary path closes first, options follow. */}
      {result.alternatives && result.alternatives.length > 0 && (
        <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
          <p
            className="text-[10px] font-medium uppercase tracking-[0.18em] mb-3"
            style={{ color: "var(--muted)" }}
          >
            Similar styles — ships sooner or costs less
          </p>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}
          >
            {result.alternatives.map((alt) => (
              <AlternativeCard
                key={alt.id}
                alternative={alt}
                onSelect={onProductSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Out-of-stock / unavailable state ────────────────────────── */
function UnavailableResult({ result, selectedSize, onProductSelect }) {
  return (
    <div className="animate-fade-slide-up">
      {/* Inline stock indicator */}
      <div className="flex items-center gap-2 mb-5">
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "#f59e0b" }}
          aria-hidden="true"
        />
        <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Not available in size {selectedSize}
        </span>
      </div>

      {/* Alternatives */}
      {result.alternatives.length > 0 && (
        <div>
          <p
            className="text-[10px] font-medium uppercase tracking-[0.18em] mb-3"
            style={{ color: "var(--muted)" }}
          >
            You may also like
          </p>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}
          >
            {result.alternatives.map((alt) => (
              <AlternativeCard
                key={alt.id}
                alternative={alt}
                onSelect={onProductSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* No alternatives edge-case */}
      {result.alternatives.length === 0 && (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          No similar styles are available right now. Check back soon.
        </p>
      )}
    </div>
  );
}
