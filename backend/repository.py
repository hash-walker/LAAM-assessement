"""
Catalog Repository & Data Transfer Objects (DTOs)

This module defines Pydantic schemas for strict API contract validation 
and implements the Repository pattern to encapsulate data access operations.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from mock_db import PRODUCTS, ALTERNATIVE_PRODUCTS, SHIPPING, DEFAULT_SHIPPING

class PriceBreakdown(BaseModel):
    """Itemized price component breakdown for transparent customer billing."""
    base_price: int = Field(..., description="Base retail price of the garment in PKR")
    stitching_fee: int = Field(..., description="Custom tailoring fee (0 if unstitched) in PKR")
    shipping_fee: int = Field(..., description="City-specific delivery fee in PKR")
    total: int = Field(..., description="Final guaranteed price payable by customer in PKR")

class AlternativeProduct(BaseModel):
    """Simplified product representation for recommendation cards."""
    id: int
    name: str
    image_url: str
    price: int
    delivery_days: int

class ConfidenceResponse(BaseModel):
    """Aggregated decision payload returned to the product detail page."""
    status: Literal["available", "out_of_stock"]
    message: str
    price: PriceBreakdown
    delivery_days: int
    alternatives: List[AlternativeProduct]

class CatalogRepository:
    """
    Data access layer for product inventory and shipping rules.
    Decouples storage mechanism (currently in-memory mock_db) from domain logic.
    """

    def get_product(self, product_id: int) -> Optional[dict]:
        """Fetch product record by unique ID."""
        return PRODUCTS.get(product_id)

    def get_shipping_rules(self, city: str) -> dict:
        """
        Retrieve city-specific shipping fee and transit days.
        Falls back to DEFAULT_SHIPPING if city is not explicitly mapped.
        """
        normalized_city = city.strip().title()
        return SHIPPING.get(normalized_city, DEFAULT_SHIPPING)

    def get_fast_alternatives(self, category: str, size: str, exclude_id: int = 0) -> List[dict]:
        """
        Query available products matching category and size, excluding the primary product.
        """
        alts = []
        for product in ALTERNATIVE_PRODUCTS:
            if product["id"] == exclude_id:
                continue
            variant = product["sizes"].get(size)
            if product["category"] == category and variant and variant["stock"] > 0:
                alts.append(product)
        return alts