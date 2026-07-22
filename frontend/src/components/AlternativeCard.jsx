import { formatCurrency } from "../lib/format.js";

export function AlternativeCard({ alternative, onSelect }) {
  function handleClick(e) {
    e.preventDefault();
    if (onSelect) onSelect(alternative.id);
  }

  return (
    <button
      id={`alternative-${alternative.id}`}
      type="button"
      onClick={handleClick}
      className="group block text-left overflow-hidden w-full transition-shadow duration-300 hover:shadow-lg"
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: 0,
        cursor: "pointer",
        outline: "none",
      }}
      aria-label={`View ${alternative.name} — ${formatCurrency(alternative.price)}, arrives in ${alternative.delivery_days} days`}
    >
      {/* Image */}
      <div className="overflow-hidden relative" style={{ background: "#f0ebe3" }}>
        <img
          src={alternative.image_url}
          alt={alternative.name}
          className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          style={{ aspectRatio: "3 / 4", display: "block" }}
        />
        {/* "View" overlay on hover */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        >
          <span
            className="text-[10px] font-medium tracking-[0.16em] uppercase px-3 py-1.5"
            style={{
              background: "var(--ink)",
              color: "white",
            }}
          >
            View
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p
          className="text-[13px] font-medium line-clamp-2 leading-snug"
          style={{ color: "var(--ink)" }}
        >
          {alternative.name}
        </p>
        <p className="mt-1 text-[13px]" style={{ color: "var(--ink)" }}>
          {formatCurrency(alternative.price)}
        </p>
        <p className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
          Arrives in {alternative.delivery_days} days
        </p>
      </div>
    </button>
  );
}
