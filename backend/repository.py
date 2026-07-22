from typing import List, Literal, Optional
from pydantic import BaseModel
from mock_db import PRODUCTS, ALTERNATIVE_PRODUCTS, SHIPPING, DEFAULT_SHIPPING

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

class ConfidenceResponse(BaseModel):
    status: Literal["available", "out_of_stock"]
    message: str
    price: PriceBreakdown
    delivery_days: int
    alternatives: List[AlternativeProduct]

class CatalogRepository:
    def get_product(self, product_id: int) -> Optional[dict]:
        return PRODUCTS.get(product_id)

    def get_shipping_rules(self, city: str) -> dict:
        normalized_city = city.strip().title()
        return SHIPPING.get(normalized_city, DEFAULT_SHIPPING)

    def get_fast_alternatives(self, category: str, size: str, exclude_id: int = 0) -> List[dict]:
        alts = []
        for product in ALTERNATIVE_PRODUCTS:
            if product["id"] == exclude_id:
                continue
            variant = product["sizes"].get(size)
            if product["category"] == category and variant and variant["stock"] > 0:
                alts.append(product)
        return alts