# Product Discovery & Purchase Confidence

A small full-stack assessment project for LAAM-style South Asian fashion commerce. The app focuses on one high-friction customer moment: deciding whether a product is actually suitable before dropping off.

## 1. Problem Understanding

Customers browsing fashion products often hesitate because the visible product card or product detail page does not answer enough practical purchase questions. A customer may like the design but still wonder whether their size is available, whether stitching changes the final price, whether delivery is trustworthy, or whether there are similar options if the product is not suitable.

I interpreted the problem as a purchase-confidence problem on the product detail page. Instead of building a full marketplace, I focused on a single decision-support interaction: a "Confidence Checker" that combines size, city, stitching preference, stock, price, delivery promise, and alternatives in one response.

## 2. Scope

### Built

- A single product detail page for "Crimson Bridal Dress".
- An interactive Confidence Checker with city, stitched/unstitched, and size inputs.
- A FastAPI backend with in-memory mock product, variant, shipping, and alternatives data.
- One backend endpoint: `POST /api/check-confidence`.
- Result states for availability, final price breakdown, delivery estimate, and alternatives.
- CORS support for local frontend development.

### Intentionally Not Built

- Marketplace browsing or search.
- Shopping cart or checkout.
- User authentication.
- Admin product management.
- Persistent database.
- Payment, inventory reservation, or order placement.

These were excluded to keep the project aligned with the 3-4 hour assessment window and focused on the stated customer confidence problem.

## 3. User Flow

1. Customer lands on a product detail page for "Crimson Bridal Dress".
2. Customer selects their city to estimate shipping time and shipping fee.
3. Customer chooses whether they want the product stitched or unstitched.
4. Customer clicks a size button: S, M, or L.
5. Frontend calls `POST /api/check-confidence`.
6. Backend calculates stock status, final price, and delivery days.
7. If available, the customer sees a green success message with itemized price and guaranteed delivery date.
8. If unavailable or outside the delivery promise window, the customer sees a warning and three alternative products in the same category and size.

## 4. Technical Approach

### Frontend Structure

- Framework: React with Vite.
- Styling: Tailwind CSS.
- Main UI: `frontend/src/App.jsx`.
- App entry: `frontend/src/main.jsx`.
- Vite config: `frontend/vite.config.js`.

The frontend keeps state local because this is a single-page assessment slice. The selected size triggers the confidence check directly, as requested, and size buttons remain clickable even when the backend knows a size is out of stock.

### Backend/API Structure

- Framework: FastAPI.
- Main API file: `backend/main.py`.
- Dependency list: `backend/requirements.txt`.
- CORS middleware configured for local Vite ports.

Endpoint:

```text
POST /api/check-confidence
```

Request:

```json
{
  "product_id": 1,
  "size": "M",
  "city": "Lahore",
  "is_stitched": true
}
```

Response includes:

- `status`: `available` or `out_of_stock`
- `message`
- `price`: base price, stitching fee, shipping fee, total
- `delivery_days`
- `alternatives`

### Data Model

The backend uses in-memory Python dictionaries/lists:

- `PRODUCTS`: main product, category, base price, stitching fee, size variants, stock, processing days.
- `ALTERNATIVE_PRODUCTS`: similar products with stock and processing days by size.
- `SHIPPING`: city-level transit days and shipping fees.

### Key Decisions

- Used one aggregate endpoint because the UI needs one decision-oriented answer, not multiple low-level resource calls.
- Treated delivery confidence as processing days plus city transit days.
- Returned alternatives when stock is unavailable or delivery exceeds 14 days.
- Kept data hardcoded to avoid database setup overhead in a short assessment.
- Used integer prices to avoid floating point money issues.

### Assumptions

- Product `1` is the current product page.
- Size `M` for the main product is intentionally out of stock.
- The 14-day delivery threshold represents the confidence promise window.
- Unknown cities use a default shipping estimate.
- Alternatives are clickable cards visually, but they do not navigate to full product pages because marketplace browsing is out of scope.

## 5. How to Run

### Backend

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

Example request:

```bash
curl -X POST http://localhost:8000/api/check-confidence \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"size":"M","city":"Lahore","is_stitched":true}'
```

### Frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5175
```

If the backend runs on another URL, create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8000
```

## 6. Tests

No formal automated tests were added within the time-box.

Validation performed:

- `python3 -m py_compile backend/main.py`
- `npm run build`
- Manual browser testing of the frontend flow.
- Manual inspection of CORS/preflight behavior from backend logs.

If adding tests next, I would start with backend API tests because the business logic is concentrated there:

- Available size returns `available`, price breakdown, and no alternatives.
- Out-of-stock size `M` returns `out_of_stock` with three alternatives.
- Stitched option adds stitching fee.
- Shipping fee and delivery days change by city.
- Delivery over 14 days returns alternatives.
- Invalid product or size returns a clear error.

## 7. Tradeoffs

- Used in-memory mock data instead of a database to prioritize the product flow and API contract.
- Built one endpoint instead of CRUD-style resources to keep the interaction customer-centered.
- Kept alternatives simple and static rather than implementing ranking, personalization, or search.
- Did not add cart/checkout because confidence happens before conversion and the assessment explicitly did not require a full marketplace.
- Used simple Tailwind styling instead of a component library to reduce setup time.
- Did not add automated tests in the initial time-box, but kept backend logic small enough to test easily.

## 8. Future Improvements

- Add automated FastAPI tests for confidence-check rules.
- Add frontend component tests for success, warning, loading, and error states.
- Replace mock data with a real inventory and product service.
- Add product-level delivery rules by brand, material, stitching complexity, and cutoff time.
- Add alternative ranking by price, delivery speed, visual similarity, brand, and size availability.
- Add clearer delivery promise language, including confidence level and last updated time.
- Track analytics for confidence checks, unavailable sizes, and alternative clicks.
- Add accessibility polish for keyboard navigation and screen-reader status messages.

## 9. AI Usage

AI was used as a coding and debugging assistant. It helped scaffold the initial FastAPI backend, React/Vite frontend, mock data, README structure, and debugging steps.

Manually reviewed or directed:

- Product scope and feature boundaries.
- The decision to focus on a single product page and Confidence Checker.
- Runtime browser behavior.
- Backend logs and CORS errors.
- Final README and audit trail requirements.

Example of corrected AI output:

- The first Vite setup had `@vitejs/plugin-react` installed but did not include `vite.config.js`. This caused the dev server to compile JSX in a way that left a missing `React` global, so the app did not mount. I corrected this by adding `frontend/vite.config.js`, restarting Vite, and confirming `npm run build` still passed.

Full AI activity log:

- See `AI_AUDIT_TRAIL.md`.

## Project Structure

```text
backend/
  main.py
  requirements.txt
frontend/
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
  src/
    App.jsx
    main.jsx
    index.css
AI_AUDIT_TRAIL.md
README.md
```
