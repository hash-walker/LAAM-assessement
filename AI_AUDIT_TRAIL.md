# AI Audit Trail

This document details all AI-assisted activities, prompt engineering steps, human oversight decisions, manual code reviews, and debugging iterations for the LAAM Product Discovery & Purchase Confidence assessment.

---

## 1. Summary of AI Usage

AI tools (Google Gemini Pro 3.1 for initial scoping/brainstorming and Claude Sonnet 4.6 & Gemini 3.6 Flash via Antigravity Assistant for pair programming) acted as accelerants under direct human supervision. AI was utilized to:
- Explore initial architecture options and industry recommendation patterns.
- Refactor backend code from a prototype into a clean 3-tier architecture (Repository pattern, Service layer, API controller).
- Implement custom domain exception classes (`ProductNotFoundError` and `InvalidSizeError`) mapped to HTTP 404 and 400 status codes.
- Create an automated `pytest` integration test suite (`backend/test_confidence_api.py`) verifying core purchase decision paths.
- Diagnose and patch cross-origin (CORS) preflight failures across dynamically assigned Vite dev server ports.
- Redesign the frontend from an internal "utility tool" look into a high-end, luxury South Asian fashion Product Detail Page (PDP).
- Synthesize editorial fashion photography assets using AI image generation to eliminate placeholder media.
- Implement stateful product-switching navigation so recommended alternatives complete the full shopping loop.

---

## 2. Human-Owned Architectural & Product Decisions

| Decision | Human Rationale |
| --- | --- |
| **Focus on PDP Purchase Confidence** | Identified hesitation on product detail pages (size availability, stitching fees, transit times) as the primary cause of drop-offs before checkout. |
| **Rejection of Premature Concurrency** | Explicitly rejected AI suggestions to build parallel search goroutines and complex concurrency, keeping the focus strictly on domain business logic and UX within the 3-4 hour window. |
| **City Selection First** | Directed city selection to occur upfront to calculate shipping fees and transit times early, resolving cost and delivery uncertainty before size selection. |
| **Intent-Capturing Size Selection** | Insisted that out-of-stock sizes remain selectable rather than disabled, enabling the system to capture user intent and return targeted alternatives in that exact size. |
| **Hierarchy-Aware Alternatives Placement** | Determined that when a product is available, faster/cheaper alternatives must be displayed *below* the primary CTA as a supplementary shelf rather than interrupting the conversion path. |
| **Separation of Concerns** | Enforced standard backend separation (`main.py`, `service.py`, `repository.py`, `mock_db.py`) with domain exceptions for clean testing and maintainability. |
| **Elimination of Internal Branding** | Rejected developer-facing names like "Confidence Checker" or "Live estimate" in favor of natural e-commerce UI patterns (standard size pickers, inline stock dots, native PDP structure). |
| **Interactive Shopping Loop** | Directed that alternative cards must be fully clickable and update the entire page state so customers can evaluate alternatives in full detail. |

---

## 3. Comprehensive Activity Log

| Phase | Activity | AI Contribution | Human Review / Action | Result |
| --- | --- | --- | --- | --- |
| **0. Initial Scoping** | Solution Architecture | Gemini suggested Go backend with parallel search goroutines & vector search. | Rejected complex concurrency as out-of-scope over-engineering; chose Python/FastAPI + React focus. | Clear, achievable scope. |
| **1. Backend Modularization** | Architecture refactoring | Split monolith into `repository.py`, `service.py`, `mock_db.py`, and `main.py`. | Directed pattern structure and approved git commit `5346365`. | Clean 3-tier architecture. |
| **2. CORS & Port Debugging** | Network error resolution | Identified that Vite auto-incremented to port `5175`, while backend CORS origins only allowed `5173`. Added range `5173-5175`. | Reported network error symptom and tested preflight using `curl -X OPTIONS`. | CORS 200 OK for dev ports. |
| **3. UX Redesign Planning** | UI/UX Plan creation | Drafted `implementation_plan.md` outlining typography, palette, price reveal, and component restructuring. | Reviewed and approved plan; specified auto-refresh requirement for options. | Alignment on luxury PDP design. |
| **4. Frontend Redesign** | React & Tailwind execution | Rewrote `App.jsx`, `ConfidenceChecker.jsx`, `ConfidenceResult.jsx`, `ProductOverview.jsx`, `SizeSelector.jsx`, `SegmentedToggle.jsx`. | Verified removal of internal tool labels and addition of `Cormorant Garamond` fonts. | Premium luxury aesthetic. |
| **5. Auto-Refresh Logic** | Real-time state syncing | Added `useEffect` hook in `ConfidenceChecker` dependent on `[city, isStitched, selectedSize]`, with cancellation flag. | Specified auto-refetch behavior when toggling stitching or city without needing re-clicks. | Real-time calculation sync. |
| **6. Media Asset Generation** | High-res image synthesis | Generated 4 editorial South Asian bridal photography assets using AI image generation tool. | Inspected generated visuals for quality and copied them to `frontend/public/images/`. | Replaced car image placeholders with authentic fashion photography. |
| **7. Schema Bug Resolution** | Schema alignment fix | Diagnosed `KeyError: 'price'` during alternative product retrieval when `mock_db.py` changed to `base_price`. | Updated `service.py` to reference `base_price` and added `exclude_id` filtering. | Smooth alternative calculation. |
| **8. Shopping Loop Cycle** | End-to-end product navigation | Updated `AlternativeCard` with hover states, connected `onProductSelect` handler, and set `key={currentProduct.id}` in `App.jsx`. | Directed that clicking an alternative must update the full PDP view. | Complete product decision loop. |
| **9. Senior Backend Polish** | Exceptions & OpenAPI docs | Introduced `ProductNotFoundError` (404) and `InvalidSizeError` (400) in `service.py` and `main.py`. Added Pydantic Field metadata in `repository.py`. | Directed senior-level backend refactoring without cluttering inline comments. | Senior-grade FastAPI backend. |
| **10. Automated Test Suite** | Integration testing | Created `backend/test_confidence_api.py` with 4 Pytest integration test cases using `TestClient`. | Verified 100% pass rate (`4 passed in 0.64s`). | Robust backend test coverage. |
| **11. Supplementary Alternatives** | Feature addition | Implemented `_find_faster_or_cheaper` in `service.py` to return alternatives below the CTA when primary product is available. | Enforced placement hierarchy (CTA first, supplementary options below). | Complete alternative discovery engine. |

---

## 4. Manual Reviews, Corrections & Refinements

### Example 1: Rejection of Over-Engineered Concurrency / Parallel Search
- **Initial AI Output:** During initial scoping, AI (Gemini) suggested building a Go backend with parallel search goroutines, worker pools, and vector search database models.
- **Issue:** Concurrency optimizations and microservice infrastructure are out of scope for a 3-hour time-boxed assessment focused on purchase confidence domain logic.
- **Manual Review & Fix:** Explicitly rejected the parallel search proposal. Redirected AI to implement a simple, readable 3-tier Python FastAPI + React application focusing on clear domain rules, intent-capturing size selection, price transparency, and delivery promise calculations.

### Example 2: Correcting CORS Port Lockout
- **Initial State:** Backend FastAPI app configured `allow_origins=["http://localhost:5173"]`.
- **Issue:** Vite dev server encountered port collision on `5173` and automatically bound to `5175`. Browser requests failed with `CORS policy: No 'Access-Control-Allow-Origin' header`.
- **Manual Review & Fix:** Inspected active ports using `ss -tlnp` and updated `backend/main.py` CORS middleware to explicitly support ports `5173`, `5174`, and `5175` for both `localhost` and `127.0.0.1`.

### Example 3: Eliminating Internal Tool Terminology
- **Initial State:** AI generated UI components containing headings like `Confidence Checker`, badges like `Live estimate`, and alert boxes explaining decision thresholds.
- **Issue:** Real e-commerce customers find internal logic labels confusing.
- **Manual Review & Fix:** Directed removal of all utility titles. Redesigned `ConfidenceChecker` into a native `ProductPanel`, replacing alert boxes with subtle status dots (green for in-stock, amber for out-of-stock) and clean itemized price cards.

### Example 4: Fixing Backend Schema Mismatch (`KeyError: 'price'`)
- **Initial State:** Updating `mock_db.py` unified all product prices under the key `base_price`.
- **Issue:** `service.py` attempted to read `alt["price"]` when constructing `AlternativeProduct` DTOs, causing 500 Internal Server Error logs.
- **Manual Review & Fix:** Traced backend error log, updated `service.py` to use `alt["base_price"]`, and added an `exclude_id` filter to prevent the currently viewed product from appearing in its own recommendations.

---

## 5. Granular Git Commit Log

```text
a59eb9e feat(backend): expand mock database with bridal collection and fix alternative product filtering
3530b99 feat(assets): add editorial bridal collection photography assets
4b7aa7c style(frontend): establish luxury editorial design system and typography
aad910a refactor(frontend): update product catalog schema and core UI selection components
73db691 feat(frontend): implement seamless product detail panel and dynamic price breakdown
db90de3 feat(frontend): enable end-to-end alternative product navigation and complete shopping loop
86c66e3 feat(backend): elevate backend architecture with domain exceptions, OpenAPI docs, and essential pytest suite
```
