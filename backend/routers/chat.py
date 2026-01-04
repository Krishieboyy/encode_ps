from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from services.chat_logic import answer_followup

router = APIRouter(tags=["chat"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="User follow-up question")
    analysis_state: Dict[str, Any] = Field(..., description="Decision card + normalized ingredients + intent")

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = None

@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    reply, actions = answer_followup(req.message, req.analysis_state)
    return ChatResponse(reply=reply, suggested_actions=actions)
