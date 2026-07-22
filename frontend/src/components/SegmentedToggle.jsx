export function SegmentedToggle({ label, options, value, onChange }) {
  return (
    <div>
      <p
        className="text-[11px] font-medium uppercase tracking-[0.16em] mb-2"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </p>

      <div
        className="grid grid-cols-2"
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "3px",
          gap: "3px",
        }}
        role="group"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={String(option.value)}
              id={`toggle-${label.toLowerCase()}-${String(option.value)}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className="h-10 text-sm font-medium transition-all duration-200"
              style={{
                background: isSelected ? "var(--ink)" : "transparent",
                color: isSelected ? "white" : "var(--muted)",
                border: "none",
                outline: "none",
                cursor: "pointer",
                borderRadius: 0,
                letterSpacing: "0.02em",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
