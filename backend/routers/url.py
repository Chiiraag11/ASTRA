"""
ASTRA URL Scan Router
POST /scan-url  — Analyze a URL for phishing/malware indicators
"""
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, AnyUrl

from core.url_analyzer import analyze_url

logger = logging.getLogger(__name__)
router = APIRouter()


class URLRequest(BaseModel):
    url: str


@router.post("/scan-url")
async def scan_url(body: URLRequest) -> JSONResponse:
    """Analyze a URL for phishing and malware indicators."""
    url = body.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    try:
        result = analyze_url(url)
        return JSONResponse({"success": True, **result})
    except Exception as e:
        logger.exception("URL scan failed")
        raise HTTPException(status_code=500, detail=f"URL analysis failed: {str(e)}")
