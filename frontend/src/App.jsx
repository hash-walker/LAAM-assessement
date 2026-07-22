import { ConfidenceChecker } from "./components/ConfidenceChecker.jsx";
import { ProductOverview } from "./components/ProductOverview.jsx";
import { product } from "./data/product.js";

function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-8 md:grid-cols-[1fr_0.92fr] md:px-8 md:py-12">
        <ProductOverview product={product} />
        <ConfidenceChecker product={product} />
      </section>
    </main>
  );
}

export default App;
