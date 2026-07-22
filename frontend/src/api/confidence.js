const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function checkConfidence({ productId, size, city, isStitched }) {
  const params = new URLSearchParams({
    product_id: String(productId),
    size: String(size),
    city: String(city),
    is_stitched: String(isStitched),
  });

  const response = await fetch(`${API_URL}/api/check-confidence?${params}`, {
    method: "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail ?? "Unable to check this option.");
  }

  return response.json();
}
