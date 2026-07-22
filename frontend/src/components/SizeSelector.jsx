export function SizeSelector({ sizes, selectedSize, onSelect }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.16em]"
          style={{ color: "var(--muted)" }}
        >
          Size
        </p>
        <button
          className="text-[11px] underline-offset-2 hover:opacity-60 transition-opacity"
          style={{
            color: "var(--muted)",
            background: "none",
            border: "none",
            textDecoration: "underline",
            cursor: "pointer",
            padding: 0,
          }}
          onClick={(e) => e.preventDefault()}
          type="button"
          aria-label="View size guide"
        >
          Size Guide
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size.value;
          return (
            <button
              key={size.value}
              id={`size-btn-${size.value}`}
              type="button"
              onClick={() => onSelect(size.value)}
              aria-pressed={isSelected}
              aria-label={`Size ${size.label}`}
              className="h-12 text-sm font-medium transition-all duration-200"
              style={{
                border: isSelected
                  ? "1.5px solid var(--ink)"
                  : "1px solid var(--border)",
                background: isSelected ? "var(--ink)" : "var(--surface)",
                color: isSelected ? "white" : "var(--ink)",
                outline: "none",
                borderRadius: 0,
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {size.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
