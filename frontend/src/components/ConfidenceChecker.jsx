import { useEffect, useState } from "react";

import { checkConfidence } from "../api/confidence.js";
import { cities, sizes } from "../data/product.js";
import { formatCurrency } from "../lib/format.js";
import { ConfidenceResult } from "./ConfidenceResult.jsx";
import { SegmentedToggle } from "./SegmentedToggle.jsx";
import { SizeSelector } from "./SizeSelector.jsx";

export function ConfidenceChecker({ product, onProductSelect }) {
  const [city, setCity] = useState("Lahore");
  const [isStitched, setIsStitched] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-refetch whenever city, stitching preference, or size changes.
  // When no size is selected yet, nothing happens.
  useEffect(() => {
    if (!selectedSize) return;

    let cancelled = false;

    setLoading(true);
    setError("");
    setResult(null);

    checkConfidence({
      productId: product.id,
      size: selectedSize,
      city,
      isStitched,
    })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Cleanup: ignore stale responses if dependencies change mid-flight
    return () => {
      cancelled = true;
    };
  }, [city, isStitched, selectedSize, product.id]);

  return (
    <div className="flex flex-col">
      {/* ── Product identity ── */}
      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--rose)" }}
        >
          Bridal Collection
        </p>

        <h1
          className="font-display mt-2 leading-[1.1]"
          style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 500, color: "var(--ink)" }}
        >
          {product.name}
        </h1>

        {/* Listed price — always visible, set before customisation */}
        <p
          className="mt-3 font-semibold"
          style={{ fontSize: "1.5rem", color: "var(--ink)", letterSpacing: "-0.01em" }}
        >
          {formatCurrency(product.price)}
        </p>

        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          {product.description}
        </p>
      </div>

      {/* ── Product configuration ── */}
      {/* No section heading — controls read as natural product options */}
      <div className="flex flex-col gap-5">
        {/* Deliver to */}
        <div>
          <label
            htmlFor="city-select"
            className="block text-[11px] font-medium uppercase tracking-[0.16em] mb-2"
            style={{ color: "var(--muted)" }}
          >
            Deliver to
          </label>
          <div className="relative">
            <select
              id="city-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-11 pl-3 pr-9 text-sm appearance-none cursor-pointer"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--ink)",
                outline: "none",
                borderRadius: 0,
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {/* Custom chevron */}
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
                style={{ color: "var(--muted)" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        {/* Stitching preference */}
        <SegmentedToggle
          label="Finish"
          options={[
            { label: "Stitched", value: true },
            { label: "Unstitched", value: false },
          ]}
          value={isStitched}
          onChange={setIsStitched}
        />

        {/* Size selection — clicking a size triggers the API */}
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSelect={setSelectedSize}
        />
      </div>

      {/* ── Inline result: price breakdown / out-of-stock / loading ── */}
      <ConfidenceResult
        error={error}
        loading={loading}
        result={result}
        selectedSize={selectedSize}
        onProductSelect={onProductSelect}
      />
    </div>
  );
}
