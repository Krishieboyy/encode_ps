from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from services.knowledge import KnowledgeBase
from services.normalize import normalize_ingredients
from services.intent import infer_intent
from services.scoring import score_fit
from services.compose import compose_decision_card

router = APIRouter(tags=["analyze"])

kb = KnowledgeBase.load_default()

class AnalyzeRequest(BaseModel):
    ingredients_text: str = Field(..., description="Raw ingredients text (comma-separated is fine)")
    optimize_for: Optional[str] = Field(
        default=None,
        description="Optional intent hint (e.g., sugar, gut, allergens, muscle, clean_label, kids, general)"
    )
    user_prefs: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional preference ledger (e.g., {'avoid': ['lactose'], 'limit': ['added_sugar']})"
    )

class AnalyzeResponse(BaseModel):
    normalized_ingredients: List[Dict[str, Any]]
    inferred_intent: Dict[str, Any]
    decision_card: Dict[str, Any]
    debug: Dict[str, Any]

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    # 1) Normalize and tag ingredients
    normalized = normalize_ingredients(req.ingredients_text, kb)

    # 2) Infer intent (intent-first without forms)
    intent = infer_intent(normalized, optimize_for=req.optimize_for, user_prefs=req.user_prefs or {})

    # 3) Score fit (traffic-light)
    fit = score_fit(normalized, intent)

    # 4) Compose decision card for UI
    card = compose_decision_card(normalized, intent, fit)

    return AnalyzeResponse(
        normalized_ingredients=normalized,
        inferred_intent=intent,
        decision_card=card,
        debug={
            "fit": fit,
            "optimize_for": req.optimize_for,
            "user_prefs": req.user_prefs or {}
        }
    )
