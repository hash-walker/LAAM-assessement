# AI Audit Trail

This document details all AI-assisted activities, prompt engineering logs, model metadata, human oversight decisions, manual code reviews, and debugging iterations for the LAAM Product Discovery & Purchase Confidence assessment.

---

## 1. Model Specifications & Audit Standards

| Audit Attribute | Value / Configuration |
| --- | --- |
| **Primary AI Models** | Google Gemini Pro 3.1 (Scoping/Research), Claude Sonnet 4.6 (Code Refactoring/Architecture), Gemini 3.6 Flash (Execution) |
| **Execution Framework** | Antigravity AI Agentic Assistant |
| **Sampling Parameters** | Used the default settings of the AI tools; I did not configure sampling parameter |
| **Tool Registry Invoked** | `write_to_file`, `replace_file_content`, `multi_replace_file_content`, `view_file`, `run_command`, `generate_image`, `manage_task`, `pytest`, `uvicorn` |
| **Human Supervision** | 100% human-in-the-loop review for all code edits, architecture choices, and git commits |

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

## 3. Prompt & System Message Log (Input/Output Audit)

### Prompt #0: Initial Problem Framing (Pre-Code Reasoning Session)
- **Input Prompt:**
  > "This is an assessment that I received from LAAM, actually I don't want you to give me a solution or anything, I will let you know what I understand about the problem, and what I am not getting, then we will move step by step into the solution."
- **Context/Grounding:** LAAM Full-Stack Assessment brief shared in full. Human engineer explicitly instructed AI *not to write code* — used AI only as a thinking partner to validate their own understanding.
- **Human Reasoning Shared (key excerpts):**
  > "This is a decision-confidence problem, not a discovery problem. The customer already likes the product — they just don't trust that it will actually work out for them (right size, on time, real price)."
  >
  > "If we grey out unavailable sizes, a user wanting that size hits a dead end and leaves. We completely lose the context of what they were trying to buy. My approach: keep out-of-stock sizes clickable. By allowing the user to click, we capture their exact intent. We can then instantly recommend similar alternative products that are available in that specific size."
  >
  > "Delivery SLA is where the real drop-off happens, especially for time-sensitive events like weddings. A vague 'ships in 2–4 weeks' is exactly the problem."
- **AI Tool Actions:** None. Pure scoping and problem-framing dialogue.
- **Human Modification:** All framing decisions were made by the human engineer before any code was generated. AI confirmed the reasoning was sound and validated the intent-capture UX pattern against industry examples (large marketplaces ranking alternatives by fulfillment speed for time-sensitive categories).

---

### Prompt #0.5: Parallel Search Scoping Decision
- **Input Prompt:**
  > "Is it a good idea to just mock that we are doing parallel search for alternatives, or is it just out of scope?"
- **Context/Grounding:** After AI (Gemini) suggested parallel async execution and goroutine-based search as an architectural improvement, the human engineer paused to explicitly evaluate whether mocking this behavior was worth the effort.
- **AI Output:** AI confirmed that for a 3-hour time-boxed assessment, parallel search is an optimization concern — not a business logic concern. Mocking it would add complexity without demonstrating meaningful judgment.
- **Human Decision & Rejection:** **OUT OF SCOPE.** The human engineer decided that the correct tradeoff was to build a simple, readable sequential alternative-ranking algorithm (`_find_faster_or_cheaper`) that demonstrates clear business logic (rank by speed, then price), and document parallel async execution as a genuine future improvement rather than a fake mock.
- **Outcome:** This decision is reflected in `service.py` and documented explicitly in `README.md → Section 8 (Future Improvements)`.

---

### Prompt #1: Build Specification & Code Generation Directive
- **Input Prompt:**
  > "Act as a Senior Full-Stack Engineer. I am completing a 3-hour time-boxed technical assessment for an e-commerce marketplace. The goal is to build a 'Purchase Confidence' feature that answers customer questions about sizing, pricing, delivery times, and alternatives to prevent drop-offs... PART 1: Backend FastAPI... PART 2: Frontend React..."
- **Context/Grounding:** Full-stack assessment brief for LAAM South Asian fashion. All core decisions (intent capture, delivery trust, alternatives hierarchy) already locked from Prompt #0.
- **AI Tool Actions:** `write_to_file` creating `backend/main.py`, `frontend/src/App.jsx`, `package.json`.
- **Human Modification:** Directed clean 3-tier folder split (`backend/` vs `frontend/`) and created `.gitignore`.

### Prompt #2: Architecture & Concurrency Brainstorming
- **Input Prompt:**
  > "If you were going to solve this how would you have solved it and what would you have considered solving it like how???"
- **AI Output:** Gemini suggested building a Go backend with Goroutine concurrency, parallel search workers, vector search databases, and SQLite.
- **Human Modification & Rejection:** **REJECTED.** The human engineer identified Go goroutine parallel search as out-of-scope over-engineering for a 3-hour Python/React evaluation. Redirected AI to focus on Python FastAPI + React with clean domain logic, intent capture, and price transparency. (See Prompt #0.5 for the specific scoping evaluation.)

### Prompt #3: UX Redesign & Auto-Refresh Directive
- **Input Prompt:**
  > "we need to improve the frontend as we don't want to show them that this is our confidence checker or anything, we need to have a proper experience for them the UI and the UX, also in e commerce or market place, one price is decided before, which should be shown, and then any additional and final price... proceed and it should be auto refresh"
- **AI Tool Actions:** `write_to_file` rebuilding `ConfidenceChecker.jsx`, `ConfidenceResult.jsx`, `ProductOverview.jsx`, `index.css`.
- **Human Modification:** Specified that listed base price (`PKR 128,000`) must be visible upfront, with itemized total breakdown revealed upon selection, and auto-refetching implemented via `useEffect` with stale response cancellation.

### Prompt #4: Editorial Photography & Shopping Loop Directive
- **Input Prompt:**
  > "I need proper images, as the now one are of car, and the next recommended one should be clickable??? I guess so that we complete the cycle"
- **AI Tool Actions:** `generate_image` producing 4 South Asian bridal collection images (`product_1.png` to `product_4.png`), `replace_file_content` connecting `onProductSelect` across `App.jsx` and `AlternativeCard.jsx`.
- **Human Modification:** Confirmed quality of editorial fashion photos and verified full PDP state swapping upon alternative selection.

### Prompt #5: Senior Backend Architecture & Test Suite Directive
- **Input Prompt:**
  > "the backend code that is written, add senior level comments that are important, do not add comments that are not needed, also we need to add tests that are absolutely needed..."
- **AI Tool Actions:** `write_to_file` creating `backend/test_confidence_api.py`, updating `service.py` with `ProductNotFoundError`/`InvalidSizeError` domain exceptions, and adding Pydantic `Field` metadata in `repository.py`.
- **Human Modification:** Verified 100% test pass rate (`pytest test_confidence_api.py` -> 4 passed in 0.37s) and ensured no junk inline comments were added.

---

## 4. Comprehensive Activity Matrix

| Phase | Activity | AI Contribution | Human Review / Action | Result |
| --- | --- | --- | --- | --- |
| **-1. Pre-Code Reasoning** | Problem framing & scoping | Used as a thinking partner only — no code generated. AI validated intent-capture UX pattern and delivery-trust hypothesis. | Human engineer defined all core decisions (clickable OOS sizes, delivery trust focus, alternatives hierarchy) *before* any prompt to write code. | Crystal-clear scope with zero wasted implementation. |
| **0. Initial Scoping** | Solution Architecture | Gemini suggested Go backend with parallel search goroutines & vector search. | Rejected complex concurrency as out-of-scope over-engineering; chose Python/FastAPI + React focus. (Parallel search explicitly scoped out, not mocked.) | Clear, achievable scope. |
| **1. Backend Modularization** | Architecture refactoring | Split monolith into `repository.py`, `service.py`, `mock_db.py`, and `main.py`. | Directed pattern structure and approved git commit `5346365`. | Clean 3-tier architecture. |
| **2. CORS & Port Debugging** | Network error resolution | Identified that Vite auto-incremented to port `5175`, while backend CORS origins only allowed `5173`. Added range `5173-5175`. | Reported network error symptom and tested preflight using `curl -X OPTIONS`. | CORS 200 OK for dev ports. |
| **3. UX Redesign Planning** | UI/UX Plan creation | Drafted `implementation_plan.md` outlining typography, palette, price reveal, and component restructuring. | Reviewed and approved plan; specified auto-refresh requirement for options. | Alignment on luxury PDP design. |
| **4. Frontend Redesign** | React & Tailwind execution | Rewrote `App.jsx`, `ConfidenceChecker.jsx`, `ConfidenceResult.jsx`, `ProductOverview.jsx`, `SizeSelector.jsx`, `SegmentedToggle.jsx`. | Verified removal of internal tool labels and addition of `Cormorant Garamond` fonts. | Premium luxury aesthetic. |
| **5. Auto-Refresh Logic** | Real-time state syncing | Added `useEffect` hook in `ConfidenceChecker` dependent on `[city, isStitched, selectedSize]`, with cancellation flag. | Specified auto-refetch behavior when toggling stitching or city without needing re-clicks. | Real-time calculation sync. |
| **6. Media Asset Generation** | High-res image synthesis | Generated 4 editorial South Asian bridal photography assets using AI image generation tool. | Inspected generated visuals for quality and copied them to `frontend/public/images/`. | Replaced car image placeholders with authentic fashion photography. |
| **7. Schema Bug Resolution** | Schema alignment fix | Diagnosed `KeyError: 'price'` during alternative product retrieval when `mock_db.py` changed to `base_price`. | Updated `service.py` to reference `base_price` and added `exclude_id` filtering. | Smooth alternative calculation. |
| **8. Shopping Loop Cycle** | End-to-end product navigation | Updated `AlternativeCard` with hover states, connected `onProductSelect` handler, and set `key={currentProduct.id}` in `App.jsx`. | Directed that clicking an alternative must update the full PDP view. | Complete product decision loop. |
| **9. Senior Backend Polish** | Exceptions & OpenAPI docs | Introduced `ProductNotFoundError` (404) and `InvalidSizeError` (400) in `service.py` and `main.py`. Added Pydantic Field metadata in `repository.py`. | Directed senior-level backend refactoring without cluttering inline comments. | Senior-grade FastAPI backend. |
| **10. Automated Test Suite** | Integration testing | Created `backend/test_confidence_api.py` with 4 Pytest integration test cases using `TestClient`. | Verified 100% pass rate (`4 passed in 0.37s`). | Robust backend test coverage. |
| **11. Supplementary Alternatives** | Feature addition | Implemented `_find_faster_or_cheaper` in `service.py` to return alternatives below the CTA when primary product is available. | Enforced placement hierarchy (CTA first, supplementary options below). | Complete alternative discovery engine. |

---

## 5. Manual Reviews, Corrections & Refinements

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

## 6. Granular Git Commit Log

```text
a59eb9e feat(backend): expand mock database with bridal collection and fix alternative product filtering
3530b99 feat(assets): add editorial bridal collection photography assets
4b7aa7c style(frontend): establish luxury editorial design system and typography
aad910a refactor(frontend): update product catalog schema and core UI selection components
73db691 feat(frontend): implement seamless product detail panel and dynamic price breakdown
db90de3 feat(frontend): enable end-to-end alternative product navigation and complete shopping loop
86c66e3 feat(backend): elevate backend architecture with domain exceptions, OpenAPI docs, and essential pytest suite
3731758 docs: complete README and AI_AUDIT_TRAIL with Gemini scoping details and rejection of premature concurrency
```
