from typing import Dict, Any, List, Tuple
import re

def answer_followup(message: str, state: Dict[str, Any]) -> Tuple[str, List[str]]:
    msg = (message or "").strip().lower()

    card = state.get("decision_card", {})
    normalized = state.get("normalized_ingredients", [])
    intent = state.get("inferred_intent", {}).get("top_intent", "general")

    fit_score = card.get("fit_score", None)
    color = card.get("color", "unknown")

    def list_by_flag(flag: str) -> List[str]:
        out = []
        for ing in normalized:
            if flag in set(ing.get("flags", [])):
                out.append(ing["raw"])
        return out

    # Simple FAQ-style follow-ups
    if re.search(r"\bok(ay)? daily\b|\bevery day\b|\bdaily\b", msg):
        if color == "green":
            reply = "Likely okay frequently for your current intent, but portion size matters. If you notice symptoms, reduce frequency."
        elif color == "yellow":
            reply = "I’d treat it as an occasional or moderate-frequency choice for your intent. If you want a daily staple, look for a simpler/less-flagged option."
        else:
            reply = "For your intent, daily use is not ideal. Consider alternatives with fewer red-flag ingredients for your goal."
        actions = ["Compare with another product", "Change optimize goal", "Show ingredients flagged"]
        return reply, actions

    if "explain" in msg or "like i'm 12" in msg or "eli12" in msg:
        reply = "Think of ingredients as signals. A few ingredients (like certain sugars, allergens, or additives) are the ones that usually matter. I highlight those first, explain the tradeoff, and tell you what I’m unsure about."
        actions = ["Show top concerns", "Compare with another product"]
        return reply, actions

    if "allergen" in msg or "lactose" in msg or "milk" in msg:
        allergens = list_by_flag("allergen")
        if allergens:
            reply = f"Allergen markers I see: {', '.join(allergens)}. If your allergy is severe, avoid and verify manufacturer cross-contamination info."
        else:
            reply = "I don’t see common allergen markers in the text provided, but always verify the label and any 'may contain' statements."
        actions = ["Show uncertainty note", "Scan/paste full label text"]
        return reply, actions

    if "sugar" in msg:
        sugars = list_by_flag("added_sugar")
        if sugars:
            reply = f"Added sugar markers detected: {', '.join(sugars)}. If you’re optimizing for sugar, this is the main reason the fit drops."
        else:
            reply = "I didn’t detect common added-sugar markers from the text provided."
        actions = ["Compare with a lower-sugar option", "Change optimize goal"]
        return reply, actions

    if "why" in msg or "reason" in msg:
        bullets = card.get("bullets", [])
        reply = "Here’s the reasoning:\n- " + "\n- ".join(bullets[:3])
        actions = ["Show all recognized ingredients", "Compare with another product"]
        return reply, actions

    # Default fallback: summarize card
    reply = (
        f"Summary for intent '{intent}': fit is {color.upper()}."
        + (f" Score {fit_score}/100." if fit_score is not None else "")
        + " Ask me 'okay daily?', 'what’s the top concern?', or 'compare with another product'."
    )
    actions = ["Okay daily?", "Top concern?", "Compare"]
    return reply, actions
