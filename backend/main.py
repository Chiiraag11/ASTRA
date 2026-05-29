"""
ASTRA Security Platform — FastAPI Backend
Run:  uvicorn main:app --reload --port 8000
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.apk import router as apk_router
from routers.url import router as url_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ASTRA Security API",
    description="Fake banking APK detector and URL phishing analyzer",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(apk_router, tags=["APK Analysis"])
app.include_router(url_router, tags=["URL Analysis"])


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "ASTRA Security API", "version": "2.0.0"}


@app.get("/")
async def root():
    return {"message": "ASTRA Security API is running. POST /scan-apk or /scan-url"}
