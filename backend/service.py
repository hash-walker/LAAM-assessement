from datetime import date, timedelta
from typing import List
from repository import CatalogRepository, ConfidenceResponse, PriceBreakdown, AlternativeProduct

class PurchaseConfidenceService:
    def __init__(self, repo: CatalogRepository = CatalogRepository()):
        self.repo = repo
        self.SLA_CUTOFF_DAYS = 14 

    def _normalize_size(self, size: str) -> str:
        size_aliases = {"SMALL": "S", "MEDIUM": "M", "LARGE": "L"}
        return size_aliases.get(size.strip().upper(), size.strip().upper())

    def evaluate_purchase(self, product_id: int, size: str, city: str, is_stitched: bool) -> ConfidenceResponse:
        product = self.repo.get_product(product_id)
        if not product:
            raise ValueError("Product not found")

        norm_size = self._normalize_size(size)
        variant = product["sizes"].get(norm_size)
        if not variant:
            raise ValueError("Size not available for this product")

        shipping = self.repo.get_shipping_rules(city)
        delivery_days = variant["processing_days"] + shipping["transit_days"]
        
        stitching_fee = product["stitching_fee"] if is_stitched else 0
        total_price = product["base_price"] + stitching_fee + shipping["fee"]
        
        price_breakdown = PriceBreakdown(
            base_price=product["base_price"],
            stitching_fee=stitching_fee,
            shipping_fee=shipping["fee"],
            total=total_price
        )

        is_out_of_stock = variant["stock"] <= 0
        misses_sla = delivery_days > self.SLA_CUTOFF_DAYS

        if is_out_of_stock or misses_sla:
            alternatives = self._find_alternatives(product["category"], norm_size, shipping["transit_days"])
            reason = "Out of stock" if is_out_of_stock else f"Delivery exceeds {self.SLA_CUTOFF_DAYS} days"
            
            return ConfidenceResponse(
                status="out_of_stock",
                message=f"{reason} in {norm_size}. Here are similar styles ready to ship.",
                price=price_breakdown,
                delivery_days=delivery_days,
                alternatives=alternatives
            )

        guaranteed_date = date.today() + timedelta(days=delivery_days)
        return ConfidenceResponse(
            status="available",
            message=f"Available in {norm_size}. Guaranteed delivery by {guaranteed_date.strftime('%B %d')}.",
            price=price_breakdown,
            delivery_days=delivery_days,
            alternatives=[]
        )

    def _find_alternatives(self, category: str, size: str, transit_days: int) -> List[AlternativeProduct]:
        raw_alts = self.repo.get_fast_alternatives(category, size)
        formatted_alts = []
        
        for alt in raw_alts:
            processing_days = alt["sizes"][size]["processing_days"]
            formatted_alts.append(AlternativeProduct(
                id=alt["id"],
                name=alt["name"],
                image_url=alt["image_url"],
                price=alt["price"],
                delivery_days=processing_days + transit_days
            ))
            
        return sorted(formatted_alts, key=lambda x: x.delivery_days)[:3]