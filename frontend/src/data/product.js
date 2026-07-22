// All products keyed by ID — mirrors the backend PRODUCTS dict.
// When an alternative is clicked, we look up the full product here.
export const products = {
  1: {
    id: 1,
    name: "Crimson Bridal Dress",
    imageUrl: "/images/product-1.png",
    price: 128000,
    description:
      "A hand-embellished crimson bridal lehenga with zari and gota patti detailing, structured fall, and made-to-order finishing.",
  },
  2: {
    id: 2,
    name: "Ruby Zari Bridal Ensemble",
    imageUrl: "/images/product-2.png",
    price: 118000,
    description:
      "A deep ruby anarkali gown with floor-length gold zari embroidery, intricate threadwork, and a matching dupatta with sequin border.",
  },
  3: {
    id: 3,
    name: "Ivory Silk Bridal Lehenga",
    imageUrl: "/images/product-3.png",
    price: 145000,
    description:
      "An ivory silk bridal lehenga with heavy pearl and zardozi embroidery, long cathedral train, and delicate floral motifs throughout.",
  },
  4: {
    id: 4,
    name: "Dusty Rose Bridal Gharara",
    imageUrl: "/images/product-4.png",
    price: 98000,
    description:
      "A dusty rose gharara set with silver and rose gold threadwork, wide palazzo trousers, and a kurta adorned with mirror work and hand embroidery.",
  },
};

// Default product shown on page load
export const product = products[1];

export const cities = [
  "Lahore",
  "Islamabad",
  "Karachi",
  "Peshawar",
  "Quetta",
  "Skardu",
];

export const sizes = [
  { label: "Small", value: "S" },
  { label: "Medium", value: "M" },
  { label: "Large", value: "L" },
];
