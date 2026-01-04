from typing import List, Dict, Any

def score_fit(normalized: List[Dict[str, Any]], intent: Dict[str, Any]) -> Dict[str, Any]:
    top = intent.get("top_intent", "general")

    # risk points: higher => worse fit
    risk = 0.0
    unknown_count = 0
    red_flags = []
    yellow_flags = []

    for ing in normalized:
        known = ing.get("known", False)
        flags = set(ing.get("flags", []))
        cat = ing.get("category", "unknown")
        ev = ing.get("evidence", "unknown")

        if not known:
            unknown_count += 1

        # scoring by intent
        if top == "sugar":
            if "added_sugar" in flags or cat == "sweetener":
                risk += 2.0
                red_flags.append(ing["raw"])
            if "high_glycemic" in flags:
                risk += 1.0
                yellow_flags.append(ing["raw"])

        elif top == "gut":
            if "emulsifier" in flags or cat == "emulsifier":
                risk += 1.3
                yellow_flags.append(ing["raw"])
            if "artificial_sweetener" in flags:
                risk += 0.8
                yellow_flags.append(ing["raw"])

        elif top == "allergens":
            if "allergen" in flags or cat == "allergen":
                risk += 2.5
                red_flags.append(ing["raw"])
            if "may_contain" in flags:
                risk += 1.0
                yellow_flags.append(ing["raw"])

        elif top == "clean_label":
            if "preservative" in flags or cat == "preservative":
                risk += 1.2
                yellow_flags.append(ing["raw"])
            if "colorant" in flags:
                risk += 0.8
                yellow_flags.append(ing["raw"])
            if not known:
                risk += 0.2

        elif top == "kids":
            if "kid_sensitive" in flags:
                risk += 1.4
                yellow_flags.append(ing["raw"])
            if "added_sugar" in flags or cat == "sweetener":
                risk += 1.6
                yellow_flags.append(ing["raw"])

        elif top == "muscle":
            # muscle intent: sugar/additives are less important; protein helps
            if "protein" in flags or cat == "protein":
                risk -= 0.8
            if "added_sugar" in flags or cat == "sweetener":
                risk += 0.7
                yellow_flags.append(ing["raw"])

        else:
            # general
            if "added_sugar" in flags:
                risk += 1.0
                yellow_flags.append(ing["raw"])
            if "allergen" in flags:
                risk += 0.8
                yellow_flags.append(ing["raw"])
            if "preservative" in flags:
                risk += 0.6
                yellow_flags.append(ing["raw"])

        # evidence-weight: if evidence is "emerging", slightly soften but add uncertainty
        if ev == "emerging":
            risk += 0.1

    # Unknowns increase uncertainty
    risk += min(1.5, 0.2 * unknown_count)

    # translate risk -> fit score 0-100
    # clamp
    score = 100 - (risk * 12)  # 12 points per risk unit
    if score < 0:
        score = 0
    if score > 100:
        score = 100

    if score >= 75:
        color = "green"
    elif score >= 45:
        color = "yellow"
    else:
        color = "red"

    return {
        "fit_score": round(score),
        "color": color,
        "risk": round(risk, 2),
        "red_flags": list(dict.fromkeys(red_flags))[:5],
        "yellow_flags": list(dict.fromkeys(yellow_flags))[:6],
        "unknown_count": unknown_count
    }