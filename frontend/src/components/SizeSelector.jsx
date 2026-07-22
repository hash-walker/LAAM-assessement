export function SizeSelector({ sizes, selectedSize, onSelect }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">Size</p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {sizes.map((size) => (
          <button
            key={size.value}
            type="button"
            onClick={() => onSelect(size.value)}
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
      <p className="mt-2 text-xs text-slate-500">
        Sizes stay selectable so unavailable options can still return alternatives.
      </p>
    </div>
  );
}
