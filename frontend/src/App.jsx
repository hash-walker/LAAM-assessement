import { useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const product = {
  id: 1,
  name: "Crimson Bridal Dress",
  imageUrl:
    "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=1200&q=80",
  price: 128000,
  description:
    "A hand-embellished crimson bridal dress with zari detailing, structured fall, and made-to-order finishing.",
};

const cities = ["Lahore", "Islamabad", "Karachi", "Peshawar", "Quetta", "Skardu"];
const sizes = [
  { label: "Small", value: "S" },
  { label: "Medium", value: "M" },
  { label: "Large", value: "L" },
];

function currency(value) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function deliveryDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function App() {
  const [city, setCity] = useState("Lahore");
  const [isStitched, setIsStitched] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSizeLabel = useMemo(() => {
    return sizes.find((size) => size.value === selectedSize)?.label ?? "";
  }, [selectedSize]);

  async function checkConfidence(size) {
    setSelectedSize(size);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/check-confidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          size,
          city,
          is_stitched: isStitched,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail ?? "Unable to check this option.");
      }

      setResult(await response.json());
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-8 md:grid-cols-[1fr_0.9fr] md:px-8 md:py-12">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-[4/5] h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
            Bridal Collection
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950 md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{product.description}</p>
          <p className="mt-5 text-2xl font-semibold text-slate-950">
            Starts at {currency(product.price)}
          </p>

          <div className="mt-8 border-t border-slate-200 pt-7">
            <h2 className="text-xl font-semibold text-slate-950">
              Confidence Checker
            </h2>

            <div className="mt-5 grid gap-5">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                City
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
                >
                  {cities.map((currentCity) => (
                    <option key={currentCity}>{currentCity}</option>
                  ))}
                </select>
              </label>

              <div>
                <p className="text-sm font-medium text-slate-700">Finish</p>
                <div className="mt-2 grid grid-cols-2 rounded-md border border-slate-300 bg-white p-1">
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => setIsStitched(value)}
                      className={`h-10 rounded px-3 text-sm font-semibold transition ${
                        isStitched === value
                          ? "bg-slate-950 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {value ? "Stitched" : "Unstitched"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Size</p>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => checkConfidence(size.value)}
                      className={`rounded-md border px-4 py-3 text-left transition ${
                        selectedSize === size.value
                          ? "border-rose-700 bg-rose-50 text-rose-900"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <span className="block text-base font-semibold">{size.value}</span>
                      <span className="text-xs">{size.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 min-h-24">
              {loading && (
                <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  Checking stock, price, and delivery promise...
                </div>
              )}

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {error}
                </div>
              )}

              {result?.status === "available" && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-semibold text-emerald-900">{result.message}</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Guaranteed delivery by {deliveryDate(result.delivery_days)}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-emerald-950">
                    <PriceLine label="Base price" value={result.price.base_price} />
                    <PriceLine label="Stitching fee" value={result.price.stitching_fee} />
                    <PriceLine label="Shipping fee" value={result.price.shipping_fee} />
                    <div className="mt-2 flex items-center justify-between border-t border-emerald-200 pt-3 text-base font-bold">
                      <span>Total</span>
                      <span>{currency(result.price.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {result?.status === "out_of_stock" && (
                <div>
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
                    <p className="font-semibold text-amber-950">
                      Out of stock in {selectedSizeLabel}
                    </p>
                    <p className="mt-1 text-sm text-amber-900">{result.message}</p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {result.alternatives.map((alternative) => (
                      <a
                        key={alternative.id}
                        href={`#alternative-${alternative.id}`}
                        className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <img
                          src={alternative.image_url}
                          alt={alternative.name}
                          className="h-28 w-full object-cover"
                        />
                        <div className="p-3">
                          <p className="text-sm font-semibold text-slate-950">
                            {alternative.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {currency(alternative.price)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {alternative.delivery_days} day delivery
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PriceLine({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span>{currency(value)}</span>
    </div>
  );
}

export default App;
