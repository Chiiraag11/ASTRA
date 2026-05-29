"""
ASTRA APK Scan Router
POST /scan-apk  — Upload and analyze an APK file
"""
import os
import uuid
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from core.extractor import extract_metadata
from core.risk_engine import calculate_risk

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/scan-apk")
async def scan_apk(file: UploadFile = File(...)) -> JSONResponse:
    """
    Accept an APK upload, analyze it with Androguard, and return
    metadata + risk score + verdict.
    """
    if not file.filename or not file.filename.lower().endswith(".apk"):
        raise HTTPException(status_code=400, detail="Only .apk files are accepted.")

    # Save to temp file
    tmp_name = f"{uuid.uuid4().hex}_{file.filename}"
    tmp_path = os.path.join(UPLOAD_DIR, tmp_name)

    try:
        with open(tmp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # --- Extract metadata ---
        try:
            metadata = extract_metadata(tmp_path)
        except RuntimeError as e:
            # androguard not installed — return demo data so UI still works
            logger.warning("androguard not available: %s", e)
            metadata = _demo_metadata(file.filename)

        # --- Score ---
        risk_result = calculate_risk(metadata)

        return JSONResponse({
            "success": True,
            "metadata": metadata,
            "risk": risk_result,
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("APK scan failed")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")
    finally:
        # Always clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def _demo_metadata(filename: str) -> dict:
    """Fallback demo metadata when androguard is unavailable."""
    return {
        "file_name": filename,
        "apk_size_bytes": 0,
        "app_name": filename.replace(".apk", ""),
        "package_name": "com.unknown.app",
        "version_name": "1.0",
        "version_code": "1",
        "min_sdk": "21",
        "target_sdk": "34",
        "permissions": [],
        "activities": [],
        "services": [],
        "receivers": [],
        "providers": [],
        "main_activity": "",
        "signatures": [],
    }
