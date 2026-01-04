// frontend/lib/api.js

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function analyzeIngredients({ ingredients_text, optimize_for, user_prefs }) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ingredients_text,
      optimize_for: optimize_for || null,
      user_prefs: user_prefs || {},
    }),
  });

  // Helpful error text
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Backend error ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}
