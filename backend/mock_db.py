# mock_db.py

PRODUCTS = {
    1: {
        "id": 1,
        "name": "Crimson Bridal Dress",
        "category": "bridal",
        "image_url": "/images/product-1.png",
        "base_price": 128000,
        "stitching_fee": 15000,
        "description": (
            "A hand-embellished crimson bridal lehenga with zari and gota patti detailing, "
            "structured fall, and made-to-order finishing."
        ),
        "sizes": {
            "S": {"stock": 4, "processing_days": 6},
            "M": {"stock": 0, "processing_days": 6},
            "L": {"stock": 2, "processing_days": 7},
        },
    },
    2: {
        "id": 2,
        "name": "Ruby Zari Bridal Ensemble",
        "category": "bridal",
        "image_url": "/images/product-2.png",
        "base_price": 118000,
        "stitching_fee": 13000,
        "description": (
            "A deep ruby anarkali gown with floor-length gold zari embroidery, "
            "intricate threadwork, and a matching dupatta with sequin border."
        ),
        "sizes": {
            "S": {"stock": 2, "processing_days": 5},
            "M": {"stock": 3, "processing_days": 5},
            "L": {"stock": 1, "processing_days": 6},
        },
    },
    3: {
        "id": 3,
        "name": "Ivory Silk Bridal Lehenga",
        "category": "bridal",
        "image_url": "/images/product-3.png",
        "base_price": 145000,
        "stitching_fee": 18000,
        "description": (
            "An ivory silk bridal lehenga with heavy pearl and zardozi embroidery, "
            "long cathedral train, and delicate floral motifs throughout."
        ),
        "sizes": {
            "S": {"stock": 1, "processing_days": 7},
            "M": {"stock": 2, "processing_days": 7},
            "L": {"stock": 0, "processing_days": 8},
        },
    },
    4: {
        "id": 4,
        "name": "Dusty Rose Bridal Gharara",
        "category": "bridal",
        "image_url": "/images/product-4.png",
        "base_price": 98000,
        "stitching_fee": 12000,
        "description": (
            "A dusty rose gharara set with silver and rose gold threadwork, "
            "wide palazzo trousers, and a kurta adorned with mirror work and hand embroidery."
        ),
        "sizes": {
            "S": {"stock": 3, "processing_days": 4},
            "M": {"stock": 2, "processing_days": 4},
            "L": {"stock": 1, "processing_days": 5},
        },
    },
}

# Alternatives pool: every product can be suggested as an alternative for others
ALTERNATIVE_PRODUCTS = [
    PRODUCTS[2],
    PRODUCTS[3],
    PRODUCTS[4],
]

SHIPPING = {
    "Lahore": {"transit_days": 2, "fee": 500},
    "Islamabad": {"transit_days": 3, "fee": 700},
    "Karachi": {"transit_days": 4, "fee": 900},
}

DEFAULT_SHIPPING = {"transit_days": 6, "fee": 1000}