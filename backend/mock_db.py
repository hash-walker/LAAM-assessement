# mock_db.py

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
    # ... (other alternatives)
]

SHIPPING = {
    "Lahore": {"transit_days": 2, "fee": 500},
    "Islamabad": {"transit_days": 3, "fee": 700},
    "Karachi": {"transit_days": 4, "fee": 900},
}

DEFAULT_SHIPPING = {"transit_days": 6, "fee": 1000}