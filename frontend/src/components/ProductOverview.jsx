export function ProductOverview({ product }) {
  return (
    <div className="md:sticky" style={{ top: "calc(3.5rem + 1.5rem)" }}>
      {/* Main image */}
      <div
        className="overflow-hidden"
        style={{ background: "#f0ebe3" }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
          style={{ aspectRatio: "3 / 4", display: "block" }}
        />
      </div>

      {/* Thumbnail strip — structured for future multi-image support */}
      <div className="mt-3 flex gap-2">
        <button
          aria-label={`View image of ${product.name}`}
          className="overflow-hidden flex-shrink-0 transition-opacity hover:opacity-75"
          style={{
            width: 56,
            height: 72,
            border: "1.5px solid var(--ink)",
            background: "#f0ebe3",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <img
            src={product.imageUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
}
