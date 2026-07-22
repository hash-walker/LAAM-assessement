"""
Purchase Confidence Domain Service

Implements core business logic for evaluating product availability, calculating 
itemized final pricing, forecasting delivery dates, and recommending alternatives.
"""

from datetime import date, timedelta
from typing import List
from repository import CatalogRepository, ConfidenceResponse, PriceBreakdown, AlternativeProduct


class ProductNotFoundError(Exception):
    """Raised when a requested product ID does not exist in the catalog."""
    pass


class InvalidSizeError(Exception):
    """Raised when a requested size variant is not valid for the product."""
    pass


class PurchaseConfidenceService:
    """
    Domain service evaluating purchase confidence for a single PDP interaction.
    Uses Dependency Injection for the repository to support unit testing with test doubles.
    """

    def __init__(self, repo: CatalogRepository = CatalogRepository()):
        self.repo = repo
        self.SLA_CUTOFF_DAYS = 14  # Maximum acceptable delivery window for purchase confidence

    def _normalize_size(self, size: str) -> str:
        """Standardize size strings (e.g. 'small' -> 'S')."""
        size_aliases = {"SMALL": "S", "MEDIUM": "M", "LARGE": "L"}
        cleaned = size.strip().upper()
        return size_aliases.get(cleaned, cleaned)

    def evaluate_purchase(self, product_id: int, size: str, city: str, is_stitched: bool) -> ConfidenceResponse:
        """
        Evaluate customer context against catalog state and delivery SLA rules.
        
        Returns an aggregated decision payload containing:
        - Stock status ('available' vs 'out_of_stock')
        - Guaranteed delivery date or SLA breach reason
        - Itemized total price breakdown
        - Supplementary faster/cheaper alternative recommendations
        """
        product = self.repo.get_product(product_id)
        if not product:
            raise ProductNotFoundError(f"Product with ID {product_id} was not found.")

        norm_size = self._normalize_size(size)
        variant = product["sizes"].get(norm_size)
        if not variant:
            raise InvalidSizeError(f"Size '{size}' is not available for product '{product['name']}'.")

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

        # Branch 1: Out of stock or SLA breach -> Primary status is unavailable
        if is_out_of_stock or misses_sla:
            alternatives = self._find_alternatives(
                category=product["category"],
                size=norm_size,
                transit_days=shipping["transit_days"],
                exclude_id=product["id"]
            )
            reason = "Out of stock" if is_out_of_stock else f"Delivery exceeds {self.SLA_CUTOFF_DAYS} days"
            
            return ConfidenceResponse(
                status="out_of_stock",
                message=f"{reason} in size {norm_size}. Here are similar styles ready to ship.",
                price=price_breakdown,
                delivery_days=delivery_days,
                alternatives=alternatives
            )

        # Branch 2: Available within SLA window
        guaranteed_date = date.today() + timedelta(days=delivery_days)

        # Retrieve supplementary alternatives (faster or cheaper) to present below primary CTA
        faster_or_cheaper = self._find_faster_or_cheaper(
            category=product["category"],
            size=norm_size,
            transit_days=shipping["transit_days"],
            primary_delivery_days=delivery_days,
            primary_price=product["base_price"],
            exclude_id=product["id"],
        )

        return ConfidenceResponse(
            status="available",
            message=f"Available in size {norm_size}. Guaranteed delivery by {guaranteed_date.strftime('%B %d')}.",
            price=price_breakdown,
            delivery_days=delivery_days,
            alternatives=faster_or_cheaper,
        )

    def _find_alternatives(self, category: str, size: str, transit_days: int, exclude_id: int = 0) -> List[AlternativeProduct]:
        """Fetch up to 3 fast alternatives matching category and size for out-of-stock fallback."""
        raw_alts = self.repo.get_fast_alternatives(category, size, exclude_id)
        formatted_alts = []
        
        for alt in raw_alts:
            processing_days = alt["sizes"][size]["processing_days"]
            formatted_alts.append(AlternativeProduct(
                id=alt["id"],
                name=alt["name"],
                image_url=alt["image_url"],
                price=alt["base_price"],
                delivery_days=processing_days + transit_days
            ))
            
        return sorted(formatted_alts, key=lambda x: x.delivery_days)[:3]

    def _find_faster_or_cheaper(
        self,
        category: str,
        size: str,
        transit_days: int,
        primary_delivery_days: int,
        primary_price: int,
        exclude_id: int = 0,
    ) -> List[AlternativeProduct]:
        """
        Return alternatives that are strictly faster OR strictly cheaper than the
        primary product. Capped at 2 so the shelf is supplementary, not distracting.
        Only shown below the Add to Bag CTA — hierarchy, not disruption.
        """
        raw_alts = self.repo.get_fast_alternatives(category, size, exclude_id)
        candidates = []

        for alt in raw_alts:
            processing_days = alt["sizes"][size]["processing_days"]
            alt_delivery = processing_days + transit_days
            alt_price = alt["base_price"]

            is_faster = alt_delivery < primary_delivery_days
            is_cheaper = alt_price < primary_price

            if is_faster or is_cheaper:
                candidates.append(AlternativeProduct(
                    id=alt["id"],
                    name=alt["name"],
                    image_url=alt["image_url"],
                    price=alt_price,
                    delivery_days=alt_delivery,
                ))

        # Sort by delivery speed first, then price — show at most 2
        return sorted(candidates, key=lambda x: (x.delivery_days, x.price))[:2]