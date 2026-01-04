from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.analyze import router as analyze_router
from routers.chat import router as chat_router

app = FastAPI(title="Ingredient Copilot API", version="1.0.0")

# CORS for local dev (Next.js -> FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

@app.get("/health")
def health():
    return {"ok": True}
