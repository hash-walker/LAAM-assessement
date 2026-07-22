"""
Essential API Integration Tests for Purchase Confidence Engine.

Focuses exclusively on critical domain invariants:
1. Happy path: Available size returns 200, status="available", accurate price breakdown & delivery.
2. Out-of-stock path: Unavailable size returns 200, status="out_of_stock", & relevant alternatives.
3. Edge case: Non-existent product ID returns HTTP 404.
4. Edge case: Invalid size string returns HTTP 400.
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_available_product_returns_itemized_price_and_delivery():
    """Verify that an in-stock product configuration returns 200 with complete price & delivery data."""
    response = client.get(
        "/api/check-confidence",
        params={
            "product_id": 1,
            "size": "S",
            "city": "Lahore",
            "is_stitched": True
        }
    )
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "available"
    assert "Guaranteed delivery by" in data["message"]
    
    # Verify exact price breakdown calculation: Base (128,000) + Stitching (15,000) + Shipping (500) = 143,500
    price = data["price"]
    assert price["base_price"] == 128000
    assert price["stitching_fee"] == 15000
    assert price["shipping_fee"] == 500
    assert price["total"] == 143500

    # Total days: 6 (processing) + 2 (transit) = 8 days
    assert data["delivery_days"] == 8


def test_out_of_stock_product_returns_alternatives():
    """Verify that an out-of-stock variant returns 200 with status='out_of_stock' and alternative recommendations."""
    # Product 1, Size M is stock=0 in mock_db
    response = client.get(
        "/api/check-confidence",
        params={
            "product_id": 1,
            "size": "M",
            "city": "Lahore",
            "is_stitched": False
        }
    )
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "out_of_stock"
    assert "Out of stock" in data["message"]
    assert len(data["alternatives"]) > 0

    # Ensure the primary product (id=1) is excluded from alternatives
    alt_ids = [alt["id"] for alt in data["alternatives"]]
    assert 1 not in alt_ids


def test_nonexistent_product_returns_404():
    """Verify that requesting an invalid product ID returns HTTP 404 Not Found."""
    response = client.get(
        "/api/check-confidence",
        params={
            "product_id": 99999,
            "size": "S",
            "city": "Lahore"
        }
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_invalid_size_returns_400():
    """Verify that requesting an unsupported size returns HTTP 400 Bad Request."""
    response = client.get(
        "/api/check-confidence",
        params={
            "product_id": 1,
            "size": "XXXL",
            "city": "Lahore"
        }
    )
    assert response.status_code == 400
    assert "not available" in response.json()["detail"].lower()
