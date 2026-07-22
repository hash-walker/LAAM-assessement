import { useState } from "react";
import { ConfidenceChecker } from "./components/ConfidenceChecker.jsx";
import { ProductOverview } from "./components/ProductOverview.jsx";
import { products, product as defaultProduct } from "./data/product.js";

function App() {
  // currentProduct is stateful so clicking an alternative swaps the full page
  const [currentProduct, setCurrentProduct] = useState(defaultProduct);

  function handleProductSelect(alternativeId) {
    const next = products[alternativeId];
    if (next) {
      setCurrentProduct(next);
      // Scroll back to top so the new product is in view
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* ── Navigation ── */}
      <nav
        className="sticky top-0 z-50"
        style={{ background: "var(--ink)", borderBottom: "1px solid #1a1a1a" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12 h-14">
          {/* Logo */}
          <button
            className="font-display text-2xl font-medium tracking-[0.18em] text-white select-none bg-transparent border-0 cursor-pointer p-0"
            aria-label="LAAM home"
            onClick={() => {
              setCurrentProduct(defaultProduct);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            LAAM
          </button>

          {/* Nav links */}
          <ul className="hidden md:flex gap-8 text-[11px] font-medium tracking-[0.16em] uppercase text-neutral-400 list-none m-0 p-0">
            {["New In", "Bridal", "Pret", "Sale"].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 no-underline"
                  style={{ color: "inherit" }}
                  onClick={(e) => e.preventDefault()}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>

          {/* Icon actions */}
          <div className="flex items-center gap-5 text-neutral-400">
            <button
              aria-label="Search"
              className="hover:text-white transition-colors duration-200 p-0 border-0 bg-transparent cursor-pointer"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <button
              aria-label="Shopping bag"
              className="hover:text-white transition-colors duration-200 p-0 border-0 bg-transparent cursor-pointer"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-[11px] text-neutral-400 list-none m-0 p-0">
            {["Bridal", "Dresses"].map((crumb) => (
              <li key={crumb} className="flex items-center gap-2">
                <a
                  href="#"
                  className="hover:text-neutral-700 transition-colors duration-150 no-underline"
                  style={{ color: "inherit" }}
                  onClick={(e) => e.preventDefault()}
                >
                  {crumb}
                </a>
                <span aria-hidden="true" className="text-neutral-300">/</span>
              </li>
            ))}
            <li className="text-neutral-600">{currentProduct.name}</li>
          </ol>
        </nav>
      </div>

      {/* ── Product layout ──
          key={currentProduct.id} forces ConfidenceChecker to fully remount
          whenever the product changes, resetting size selection & result state. ── */}
      <main className="mx-auto max-w-7xl px-6 md:px-12 py-6 md:py-8">
        <div className="grid md:grid-cols-[1.05fr_1fr] gap-8 md:gap-14 lg:gap-20 items-start">
          <ProductOverview product={currentProduct} />
          <ConfidenceChecker
            key={currentProduct.id}
            product={currentProduct}
            onProductSelect={handleProductSelect}
          />
        </div>
      </main>

      {/* ── Footer strip ── */}
      <footer className="mt-16 py-5" style={{ borderTop: "1px solid var(--border)" }}>
        <ul className="mx-auto max-w-7xl px-6 md:px-12 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[11px] tracking-wide text-neutral-500 list-none m-0 p-0">
          <li className="flex items-center gap-2">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Free shipping over PKR 5,000
          </li>
          <li className="flex items-center gap-2">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            Easy 14-day returns
          </li>
          <li className="flex items-center gap-2">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure checkout
          </li>
        </ul>
      </footer>
    </div>
  );
}

export default App;
