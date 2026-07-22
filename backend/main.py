"""
LAAM Purchase Confidence API

Thin HTTP Controller layer exposing the purchase confidence endpoint.
Handles request routing, CORS headers, parameter mapping, and HTTP status translation.
"""

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from service import PurchaseConfidenceService, ProductNotFoundError, InvalidSizeError
from repository import ConfidenceResponse

app = FastAPI(
    title="LAAM Purchase Confidence API",
    description="Real-time purchase confidence engine evaluating size availability, price breakdown, delivery promise, and alternatives.",
    version="1.0.0",
)

# CORS Middleware Configuration
# Dynamic Vite dev server port whitelist (5173 - 5175 range) to support concurrent local dev runs.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/api/check-confidence",
    response_model=ConfidenceResponse,
    summary="Evaluate purchase confidence for a product configuration",
    tags=["Purchase Confidence"],
)
async def check_purchase_confidence(
    product_id: int = Query(..., description="Unique product ID"),
    size: str = Query(..., description="Selected size variant (e.g. S, M, L)"),
    city: str = Query(..., description="Destination delivery city"),
    is_stitched: bool = Query(False, description="Whether custom stitching is requested"),
):
    """
    Evaluates customer context (size, city, stitching) against inventory and delivery SLAs.
    Returns itemized price calculation, guaranteed delivery date, and alternative options.
    """
    service = PurchaseConfidenceService()
    try:
        return service.evaluate_purchase(
            product_id=product_id,
            size=size,
            city=city,
            is_stitched=is_stitched
        )
    except ProductNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except InvalidSizeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))