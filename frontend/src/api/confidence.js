const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function checkConfidence({ productId, size, city, isStitched }) {
  const response = await fetch(`${API_URL}/api/check-confidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      size,
      city,
      is_stitched: isStitched,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail ?? "Unable to check this option.");
  }

  return response.json();
}
