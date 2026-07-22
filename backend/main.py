from datetime import date, timedelta
from typing import List, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="Purchase Confidence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConfidenceCheckRequest(BaseModel):
    product_id: int
    size: str
    city: str
    is_stitched: bool


class PriceBreakdown(BaseModel):
    base_price: int
    stitching_fee: int
    shipping_fee: int
    total: int


class AlternativeProduct(BaseModel):
    id: int
    name: str
    image_url: str
    price: int
    delivery_days: int


class ConfidenceCheckResponse(BaseModel):
    status: Literal["available", "out_of_stock"]
    message: str
    price: PriceBreakdown
    delivery_days: int
    alternatives: List[AlternativeProduct]


PRODUCTS = {
    1: {
        "id": 1,
        "name": "Crimson Bridal Dress",
        "category": "bridal",
        "image_url": "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=1200&q=80",
        "base_price": 128000,
        "stitching_fee": 15000,
        "sizes": {
            "S": {"stock": 4, "processing_days": 6},
            "M": {"stock": 0, "processing_days": 6},
            "L": {"stock": 2, "processing_days": 7},
        },
    }
}

ALTERNATIVE_PRODUCTS = [
    {
        "id": 2,
        "name": "Ruby Zari Bridal Ensemble",
        "category": "bridal",
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        "price": 118000,
        "sizes": {
            "S": {"stock": 2, "processing_days": 5},
            "M": {"stock": 3, "processing_days": 5},
            "L": {"stock": 1, "processing_days": 6},
        },
    },
    {
        "id": 3,
        "name": "Maroon Velvet Formal",
        "category": "bridal",
        "image_url": "https://images.unsplash.com/photo-1630368793960-7d4e070a6ca8?auto=format&fit=crop&w=800&q=80",
        "price": 98000,
        "sizes": {
            "S": {"stock": 1, "processing_days": 4},
            "M": {"stock": 5, "processing_days": 4},
            "L": {"stock": 2, "processing_days": 5},
        },
    },
    {
        "id": 4,
        "name": "Scarlet Handwork Lehenga",
        "category": "bridal",
        "image_url": "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
        "price": 136000,
        "sizes": {
            "S": {"stock": 1, "processing_days": 6},
            "M": {"stock": 2, "processing_days": 6},
            "L": {"stock": 1, "processing_days": 7},
        },
    },
]

SHIPPING = {
    "Lahore": {"transit_days": 2, "fee": 500},
    "Islamabad": {"transit_days": 3, "fee": 700},
    "Karachi": {"transit_days": 4, "fee": 900},
    "Peshawar": {"transit_days": 5, "fee": 950},
    "Quetta": {"transit_days": 8, "fee": 1200},
    "Skardu": {"transit_days": 10, "fee": 1600},
}

DEFAULT_SHIPPING = {"transit_days": 6, "fee": 1000}


def normalize_size(size: str) -> str:
    value = size.strip().upper()
    size_aliases = {"SMALL": "S", "MEDIUM": "M", "LARGE": "L"}
    return size_aliases.get(value, value)


def get_shipping(city: str) -> dict:
    normalized_city = city.strip().title()
    return SHIPPING.get(normalized_city, DEFAULT_SHIPPING)


def build_price(product: dict, is_stitched: bool, shipping_fee: int) -> PriceBreakdown:
    stitching_fee = product["stitching_fee"] if is_stitched else 0
    total = product["base_price"] + stitching_fee + shipping_fee
    return PriceBreakdown(
        base_price=product["base_price"],
        stitching_fee=stitching_fee,
        shipping_fee=shipping_fee,
        total=total,
    )


def find_alternatives(category: str, size: str, city: str) -> List[AlternativeProduct]:
    shipping = get_shipping(city)
    alternatives = []

    for product in ALTERNATIVE_PRODUCTS:
        variant = product["sizes"].get(size)
        if product["category"] != category or not variant or variant["stock"] <= 0:
            continue

        alternatives.append(
            AlternativeProduct(
                id=product["id"],
                name=product["name"],
                image_url=product["image_url"],
                price=product["price"],
                delivery_days=variant["processing_days"] + shipping["transit_days"],
            )
        )

    return alternatives[:3]


@app.get("/")
def health_check():
    return {"message": "Purchase Confidence API is running"}


@app.post("/api/check-confidence", response_model=ConfidenceCheckResponse)
def check_confidence(request: ConfidenceCheckRequest):
    product = PRODUCTS.get(request.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    size = normalize_size(request.size)
    variant = product["sizes"].get(size)
    if not variant:
        raise HTTPException(status_code=400, detail="Size not available for this product")

    shipping = get_shipping(request.city)
    delivery_days = variant["processing_days"] + shipping["transit_days"]
    price = build_price(product, request.is_stitched, shipping["fee"])
    guaranteed_date = date.today() + timedelta(days=delivery_days)

    if variant["stock"] <= 0:
        return ConfidenceCheckResponse(
            status="out_of_stock",
            message=f"Out of stock in {size}. Here are similar bridal options available in your size.",
            price=price,
            delivery_days=delivery_days,
            alternatives=find_alternatives(product["category"], size, request.city),
        )

    if delivery_days > 14:
        return ConfidenceCheckResponse(
            status="out_of_stock",
            message=(
                f"{product['name']} in {size} would arrive in {delivery_days} days, "
                "which is later than our 14-day confidence window."
            ),
            price=price,
            delivery_days=delivery_days,
            alternatives=find_alternatives(product["category"], size, request.city),
        )

    return ConfidenceCheckResponse(
        status="available",
        message=(
            f"{product['name']} in {size} is available and can arrive by "
            f"{guaranteed_date.strftime('%B %d, %Y')}."
        ),
        price=price,
        delivery_days=delivery_days,
        alternatives=[],
    )
