# LAAM: Product Discovery & Purchase Confidence

A full-stack purchase confidence experience for South Asian fashion. Built to solve one high-friction moment: a customer who likes a product but cannot confidently decide whether to buy it.

---

## 1. Problem Understanding

The brief describes a customer who hesitates because they cannot answer four questions from the product detail page:

- Is my size in stock?
- What will I actually pay?
- Can I trust the delivery timeline?
- Is there something better if this does not work?

The root cause is not that the information is unavailable — it is that it is scattered, conditional, and personalized. The shipping cost depends on the city. The final price depends on whether the customer wants stitching. The delivery date depends on both the product lead time and the city transit time. The right alternative depends on the specific size the customer actually wants.

A static product page cannot answer these questions. It requires a small real-time decision engine that takes the customer's specific context and gives a confident, personalized answer.

I chose to solve this as a single integrated interaction on the product detail page: the customer provides their context (city, stitching preference, size), and the page immediately responds with a complete purchase decision: final price, delivery promise, and alternatives when needed.

---

## 2. Scope

### Built

- **A contextual product detail page** with city selection, stitching toggle, and size selector that together fully configure the purchase context.
- **A single decision endpoint** (`GET /api/check-confidence`) that takes that context and returns stock status, itemized final price, delivery estimate, and alternatives in one call.
- **Real-time UI recalculation** — any change to city, stitching preference, or size immediately triggers a fresh API call, so the customer always sees the current answer for their current context.
- **An itemized price breakdown** revealing base price, stitching fee, and shipping fee separately so the customer understands exactly what drives the total.
- **A delivery promise** calculated from product processing days plus city-specific transit time, shown only when the product is available.
- **An alternative recommendations panel** returned when a size is out of stock or the delivery date exceeds a 14-day confidence window — surfacing ready-to-ship options in the same category and the same size the customer actually wanted.
- **A full shopping loop** where clicking a recommended alternative replaces the entire product page view so the customer can evaluate it completely.

### Intentionally Not Built

- **Marketplace browse or search** — the confidence decision happens after the customer has already found a product they like.
- **Shopping cart or checkout** — purchase confidence is the decision before the intent signal, not after it.
- **User authentication** — context is provided in the interaction, not stored in a session.
- **Persistent database** — in-memory mock data was the right tradeoff given the time constraint and the focus on domain logic.

---

## 3. User Flow & Design Rationale

The flow has three inputs and one decision output. The order of inputs was deliberate.

### Step 1 — City Selection

The customer selects their city first. This serves two purposes simultaneously:

1. It unlocks the shipping fee so the final price shown is always complete — not a starting price with hidden costs added later.
2. It provides the transit time that, combined with the product processing lead time, produces a real delivery estimate rather than a vague promise.

This single input eliminates two of the four confidence questions before the customer has even selected a size. The city selection provides peace of mind about what they will pay and when it will arrive, regardless of which size they choose.

### Step 2 — Stitching Preference

The customer selects whether they want the garment stitched or unstitched. This is a price-transparency feature. It does not change stock availability or the delivery date, but it changes the price, so it must be configured before showing a total. The customer needs to know upfront that stitching adds a fee, not discover it at checkout.

### Step 3 — Size Selection

The customer selects a size, which triggers the API call and reveals the final answer.

A deliberate design decision: **all sizes are selectable, including out-of-stock sizes.** This is intentional. If a size is greyed out and unclickable, the system learns nothing. If the customer can still click Medium (which is out of stock), the system knows they want Medium specifically and can return alternatives that are available in Medium. Greying out a size protects the UI from an error state but discards the customer's intent and eliminates the most valuable response the system can give — a relevant, actionable alternative for the exact size they need.

### Decision Output

If the product is in stock and delivery is within 14 days, the page shows:
- A green availability indicator
- A full itemized order summary (Base + Stitching + Shipping = Total)
- A guaranteed delivery date
- An activated "Add to Bag" button

If the product is out of stock or delivery exceeds the 14-day confidence window, the page shows:
- An amber unavailability indicator for that size
- Recommended alternatives in the same category that are available in that specific size

Clicking any alternative replaces the entire product page so the customer evaluates it fully — city, stitching, size — completing the loop.

### One Open Question

The current system only surfaces alternatives when the primary product is out of stock or misses the 14-day SLA. But what if size S is available in 8 days and a similar product ships in 4 days at a lower price — should the system show that even when the primary product is available?

**Yes — and the data from major platforms supports it.** Amazon, ASOS, Myntra, and Zalando all show "similar items" or "faster options" shelves even on fully in-stock product pages. Showing alternatives on a live product does not hurt conversion — it increases overall confidence because customers who compare options feel they made an informed choice rather than a rushed one. On a marketplace like LAAM, the customer switching to a different product is still a successful outcome.

The reason this was deferred is not a concern about confidence, but a **placement and scope decision**. The risk is not in showing alternatives — it is in showing them at the wrong moment:

- Surfacing "here's something cheaper" *above* or *alongside* the Add to Bag button interrupts the primary purchase path and creates hesitation at the point of decision.
- A "Ships sooner" or "You may also like" shelf *below* the confirmed result and the Add to Bag button is purely additive — the customer completes the primary decision first, then can explore further.

This distinction is hierarchy, not presence. In a production version, a secondary alternatives shelf below the available-result state would be the right next feature to build and A/B test.


---

## 4. Technical Approach

### Frontend

- **Framework:** React 18 with Vite.
- **Styling:** Tailwind CSS utilities with a custom CSS design system (`src/index.css`) defining a luxury editorial palette (warm cream `#faf8f5`, off-black `#0d0d0d`) and Cormorant Garamond typography.
- **Key Component:** `ConfidenceChecker.jsx` manages the city, stitching, and size state. A `useEffect` hook dependent on all three re-fires the API call automatically whenever any input changes, with a cleanup cancellation flag to discard stale responses if a new call starts before the previous one resolves.
- **Product Switching:** `App.jsx` holds the active product as state. `key={currentProduct.id}` on the configuration panel ensures a full remount (clearing size selection and results) when an alternative is selected.

### Backend

- **Framework:** FastAPI with Pydantic v2 validation.
- **Architecture:** Separated into four layers to keep concerns clean and the code testable: `main.py` (HTTP routing), `service.py` (business logic), `repository.py` (data access), `mock_db.py` (in-memory data).
- **Endpoint:** `GET /api/check-confidence?product_id=1&size=M&city=Lahore&is_stitched=true` — a single aggregated endpoint that returns the full decision in one response.
- **SLA Logic:** 14-day delivery window. Alternatives surface when stock is zero or when `processing_days + transit_days > 14`.

### Data Model

```json
{
  "status": "available",
  "price": {
    "base_price": 128000,
    "stitching_fee": 15000,
    "shipping_fee": 500,
    "total": 143500
  },
  "delivery_days": 8,
  "alternatives": []
}
```

### Key Assumptions

- Pakistan is the target market. Cities and transit times are Pakistan-specific.
- Unknown cities fall back to a default transit estimate rather than blocking the request.
- Stock at zero means out of stock. No distinction is made between "waitlist available" and "permanently unavailable."

---

## 5. How to Run

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5175`).

---

## 6. Tests & Validation

### Automated Backend Tests
An integration test suite has been added using `pytest` and FastAPI `TestClient` (`backend/test_confidence_api.py`), covering the essential purchase confidence decision paths:

1. `test_available_product_returns_itemized_price_and_delivery()`: Verifies HTTP 200, status="available", itemized price breakdown (Base + Stitching + Shipping = Total), and guaranteed delivery date.
2. `test_out_of_stock_product_returns_alternatives()`: Verifies HTTP 200, status="out_of_stock", and relevant alternative recommendations (excluding primary product).
3. `test_nonexistent_product_returns_404()`: Verifies domain exception handling and HTTP 404 response for invalid product IDs.
4. `test_invalid_size_returns_400()`: Verifies input validation and HTTP 400 response for unsupported sizes.

#### Running Tests Locally

```bash
cd backend
source .venv/bin/activate
pytest test_confidence_api.py
```

### Build & Syntax Verification
- Backend syntax check: `python3 -m py_compile backend/main.py backend/service.py`
- Frontend production build: `cd frontend && npm run build`


---

## 7. Tradeoffs

| Tradeoff | Decision | Why |
| --- | --- | --- |
| In-memory data vs. database | In-memory | Saved setup time; domain logic and UX were the submission's value, not infrastructure. Repository pattern isolates the data layer so it is straightforward to replace. |
| Greyed-out unavailable sizes vs. selectable | All selectable | Capturing user intent (the specific size they want) is more valuable than a cleaner error state. Without this, alternative recommendations would be generic rather than targeted. |
| One aggregated endpoint vs. separate resource APIs | One endpoint | The UI needs one decision, not five data lookups. A single response eliminates frontend orchestration complexity and reduces loading states. |
| Static city list vs. geolocation | Static dropdown | Geolocation requires permissions and adds complexity. A dropdown is faster, more reliable, and gives the customer explicit control over where they are shipping. |

---

## 8. Future Improvements

1. **Low-stock urgency signals:** Show "Only 2 left in size S" to give customers a real reason to act now, not eventually.
2. **Proactive faster alternatives:** When the primary product is available but a similar product ships significantly sooner or at a lower total price, surface it below the primary result as a comparison option.
3. **Delivery cutoff time awareness:** Factor in whether an order placed today makes the day's processing cutoff, and adjust the delivery estimate accordingly (e.g., "Order within 3 hours for this delivery date").
4. **Persistent inventory:** Replace in-memory mock with a real database with stock reservation so displayed availability reflects actual committed inventory.

---

## 9. AI Usage

AI (Antigravity Assistant) was used as a pair-programming collaborator throughout the project under direct supervision.

**What AI helped with:**
- Scaffolding the initial FastAPI backend structure
- Refactoring a single-file backend into a clean 3-tier architecture (`repository.py`, `service.py`, `mock_db.py`)
- Writing the `useEffect` auto-refresh hook with stale response cancellation
- Implementing the `key={currentProduct.id}` product-switching pattern
- Generating editorial fashion photography for the product catalog
- Executing the git commit sequence

**What I directed or corrected manually:**
- All product and UX decisions: the city-first flow, the intentional all-sizes-selectable design, the e-commerce price reveal pattern (upfront base price, itemized breakdown on selection)
- Removing internal developer labels ("Confidence Checker", "Live estimate") from the customer-facing UI
- Directing the visual design toward a luxury South Asian fashion aesthetic (Cormorant Garamond typography, warm cream palette, editorial image style)
- Specifying that alternative cards must be fully interactive and complete the shopping loop

**Example of corrected AI output:**
The initial AI-generated UI exposed a section header reading "Confidence Checker" with a subtitle: *"Get stock, final price, delivery, and alternatives in one check."* I removed this entirely. In a real e-commerce product, internal logic names do not appear in customer interfaces. The controls were redesigned to read as standard product configuration options — the same interaction pattern a customer would encounter on any fashion marketplace — with the intelligence running silently behind it.

Full activity log: [`AI_AUDIT_TRAIL.md`](./AI_AUDIT_TRAIL.md)
