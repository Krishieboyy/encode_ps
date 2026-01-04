from typing import List, Dict, Any, Optional
from collections import defaultdict

# Supported intents in this MVP
INTENTS = [
    "general",
    "sugar",
    "gut",
    "allergens",
    "muscle",
    "clean_label",
    "kids",
]

def infer_intent(
    normalized_ingredients: List[Dict[str, Any]],
    optimize_for: Optional[str],
    user_prefs: Dict[str, Any],
) -> Dict[str, Any]:
    scores = defaultdict(float)
    reasons = defaultdict(list)

    # 1) explicit hint
    if optimize_for and optimize_for in INTENTS:
        scores[optimize_for] += 2.0
        reasons[optimize_for].append("User selected optimize_for")

    # 2) preference ledger influences intent
    avoid = set((user_prefs.get("avoid") or []))
    limit = set((user_prefs.get("limit") or []))
    goals = set((user_prefs.get("goals") or []))

    if "lactose" in avoid or "milk" in avoid or "dairy" in avoid:
        scores["allergens"] += 1.5
        reasons["allergens"].append("Preference: avoid dairy/lactose")

    if "added_sugar" in limit or "sugar" in limit:
        scores["sugar"] += 1.5
        reasons["sugar"].append("Preference: limit sugar")

    if "bulking" in goals or "muscle" in goals or "protein" in goals:
        scores["muscle"] += 1.0
        reasons["muscle"].append("Goal: muscle/protein")

    # 3) ingredient-trigger inference
    for ing in normalized_ingredients:
        flags = set(ing.get("flags", []))
        cat = ing.get("category", "unknown")

        if "added_sugar" in flags or cat == "sweetener":
            scores["sugar"] += 1.0
            reasons["sugar"].append(f"Sweetener/sugar marker: {ing['raw']}")

        if "emulsifier" in flags or cat == "emulsifier":
            scores["gut"] += 0.7
            reasons["gut"].append(f"Emulsifier marker: {ing['raw']}")

        if "preservative" in flags or cat == "preservative":
            scores["clean_label"] += 0.6
            reasons["clean_label"].append(f"Preservative marker: {ing['raw']}")

        if "allergen" in flags or cat == "allergen":
            scores["allergens"] += 1.2
            reasons["allergens"].append(f"Allergen marker: {ing['raw']}")

        if "protein" in flags or cat == "protein":
            scores["muscle"] += 0.8
            reasons["muscle"].append(f"Protein marker: {ing['raw']}")

        if "kid_sensitive" in flags:
            scores["kids"] += 0.8
            reasons["kids"].append(f"Often avoided for kids: {ing['raw']}")

    # default
    scores["general"] += 0.2
    reasons["general"].append("Default fallback")

    # choose top intent
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_intent, top_score = ranked[0]

    # confidence heuristic: how separated is top intent from second?
    second_score = ranked[1][1] if len(ranked) > 1 else 0.0
    gap = max(0.0, top_score - second_score)

    if top_score < 0.8:
        confidence = "low"
    elif gap < 0.4:
        confidence = "medium"
    else:
        confidence = "high"

    return {
        "top_intent": top_intent,
        "confidence": confidence,
        "scores": dict(ranked),
        "reasons": {k: v[:3] for k, v in reasons.items() if v},  # keep short
    }
