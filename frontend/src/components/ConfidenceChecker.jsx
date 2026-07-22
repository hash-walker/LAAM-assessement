import { useMemo, useState } from "react";

import { checkConfidence } from "../api/confidence.js";
import { cities, sizes } from "../data/product.js";
import { ConfidenceResult } from "./ConfidenceResult.jsx";
import { SegmentedToggle } from "./SegmentedToggle.jsx";
import { SizeSelector } from "./SizeSelector.jsx";

export function ConfidenceChecker({ product }) {
  const [city, setCity] = useState("Lahore");
  const [isStitched, setIsStitched] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSizeLabel = useMemo(() => {
    return sizes.find((size) => size.value === selectedSize)?.label ?? "";
  }, [selectedSize]);

  async function handleSizeSelect(size) {
    setSelectedSize(size);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const confidence = await checkConfidence({
        productId: product.id,
        size,
        city,
        isStitched,
      });
      setResult(confidence);
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
          Bridal Collection
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
          {product.name}
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{product.description}</p>
      </div>

      <section className="pt-6" aria-labelledby="confidence-checker-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="confidence-checker-title"
              className="text-xl font-semibold text-slate-950"
            >
              Confidence Checker
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Get stock, final price, delivery, and alternatives in one check.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Live estimate
          </span>
        </div>

        <div className="mt-5 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            City
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
            >
              {cities.map((currentCity) => (
                <option key={currentCity}>{currentCity}</option>
              ))}
            </select>
          </label>

          <SegmentedToggle
            label="Finish"
            options={[
              { label: "Stitched", value: true },
              { label: "Unstitched", value: false },
            ]}
            value={isStitched}
            onChange={setIsStitched}
          />

          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSelect={handleSizeSelect}
          />
        </div>

        <ConfidenceResult
          error={error}
          loading={loading}
          result={result}
          selectedSizeLabel={selectedSizeLabel}
        />
      </section>
    </div>
  );
}
