from typing import List, Dict, Any

def _pick_top_concerns(intent: str, fit: Dict[str, Any]) -> List[str]:
    reds = fit.get("red_flags", [])
    yellows = fit.get("yellow_flags", [])

    concerns = []
    if intent == "sugar":
        if reds:
            concerns.append(f"Added sugar markers: {', '.join(reds[:3])}")
        if yellows and len(concerns) < 2:
            concerns.append(f"Possible fast carbs: {', '.join(yellows[:2])}")
    elif intent == "allergens":
        if reds:
            concerns.append(f"Allergen risk: {', '.join(reds[:3])}")
        if yellows and len(concerns) < 2:
            concerns.append(f"Potential traces / caution: {', '.join(yellows[:2])}")
    elif intent == "gut":
        if yellows:
            concerns.append(f"Emulsifiers/sweeteners to watch: {', '.join(yellows[:3])}")
    elif intent == "clean_label":
        if yellows:
            concerns.append(f"Additives present: {', '.join(yellows[:3])}")
    elif intent == "kids":
        if yellows:
            concerns.append(f"Kid-sensitive markers: {', '.join(yellows[:3])}")
    elif intent == "muscle":
        if reds:
            concerns.append(f"Sugar may reduce fit: {', '.join(reds[:2])}")
        else:
            concerns.append("No major red flags for muscle intent detected")
    else:
        if yellows:
            concerns.append(f"Notable ingredients: {', '.join(yellows[:3])}")

    return concerns[:2] if concerns else ["No major concerns detected from this label text"]

def _tradeoffs(intent: str) -> str:
    if intent == "sugar":
        return "Lower-sugar options sometimes use sweeteners; better calories, mixed tolerance for some."
    if intent == "gut":
        return "Emulsifiers are common in processed foods; effects vary by person and evidence is still evolving."
    if intent == "clean_label":
        return "Clean-label choices often trade shelf-life for fewer additives."
    if intent == "muscle":
        return "Higher-protein products may still include sweeteners/flavor systems for taste."
    if intent == "kids":
        return "Kids vary: some tolerate additives fine; others do better with simpler ingredient lists."
    if intent == "allergens":
        return "Even small amounts can matter for allergies; if severe, avoid and verify manufacturer info."
    return "Ingredients don’t tell the whole story (portion size and frequency matter)."

def _uncertainty(normalized: List[Dict[str, Any]], fit: Dict[str, Any], intent: Dict[str, Any]) -> str:
    unknown = fit.get("unknown_count", 0)
    confidence = intent.get("confidence", "medium")
    if unknown >= 2:
        return "Some ingredients couldn’t be confidently recognized (label/OCR ambiguity). Double-check the pack."
    if confidence == "low":
        return "I’m not fully sure what you’re optimizing for—tap a goal (Sugar/Gut/Allergens/etc.) for sharper guidance."
    return "Amounts matter, but ingredient lists don’t show quantities—treat this as a cautious flag, not a verdict."

def compose_decision_card(
    normalized: List[Dict[str, Any]],
    intent: Dict[str, Any],
    fit: Dict[str, Any],
) -> Dict[str, Any]:
    top_intent = intent.get("top_intent", "general")

    concerns = _pick_top_concerns(top_intent, fit)
    tradeoff = _tradeoffs(top_intent)
    uncertainty = _uncertainty(normalized, fit, intent)

    # A short "why it matters" line based on intent
    why = {
        "sugar": "Added sugars can affect energy swings, acne triggers for some, and calorie control.",
        "gut": "Some additives/emulsifiers may bother sensitive guts; reactions are personal.",
        "allergens": "Allergen exposure can be serious; label signals matter more than most nutrition claims.",
        "clean_label": "If you prefer fewer additives, preservatives/colorants are the main signals.",
        "kids": "For kids, simpler ingredient lists often reduce trial-and-error with sensitivities.",
        "muscle": "For muscle goals, protein markers help; watch excess sugar if you’re leaning out.",
        "general": "Portion size + frequency matters; ingredients help spot obvious flags.",
    }.get(top_intent, "Ingredients help spot obvious flags.")

    return {
        "fit_score": fit["fit_score"],
        "color": fit["color"],
        "top_intent": top_intent,
        "headline": f"{fit['color'].upper()} fit for '{top_intent}'",
        "why_it_matters": why,
        "bullets": [
            f"Top concern: {concerns[0]}",
            f"Tradeoff: {tradeoff}",
            f"Uncertainty: {uncertainty}",
        ],
        "details": {
            "concerns": concerns,
            "tradeoff": tradeoff,
            "uncertainty": uncertainty,
            "recognized_count": sum(1 for x in normalized if x.get("known")),
            "unknown_count": fit.get("unknown_count", 0),
        }
    }
