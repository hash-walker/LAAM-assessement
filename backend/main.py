from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# Import your service and schemas
from service import PurchaseConfidenceService
from repository import ConfidenceResponse

app = FastAPI(title="LAAM Purchase Confidence API")

# Add CORS so your React frontend can talk to it
# Vite auto-increments the port (5173 → 5174 → 5175) when a port is in use,
# so we whitelist the full common range to avoid CORS failures during dev.
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

@app.get("/api/check-confidence", response_model=ConfidenceResponse)
async def check_purchase_confidence(
    product_id: int, 
    size: str, 
    city: str, 
    is_stitched: bool = False
):
    service = PurchaseConfidenceService()
    try:
        return service.evaluate_purchase(product_id, size, city, is_stitched)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))