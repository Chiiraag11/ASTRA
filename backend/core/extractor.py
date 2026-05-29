"""
ASTRA APK Metadata Extractor
Uses Androguard to extract metadata from APK files.
"""
import os
from typing import Dict, Any


def extract_metadata(apk_path: str) -> Dict[str, Any]:
    """
    Extract metadata from an APK file using Androguard.
    Returns a dictionary with all APK metadata.
    """
    try:
        from androguard.core.apk import APK
    except ImportError:
        raise RuntimeError(
            "androguard is not installed. Run: pip install androguard"
        )

    if not os.path.isfile(apk_path):
        raise FileNotFoundError(f"APK not found: {apk_path}")

    a = APK(apk_path)

    # Extract v2/v3 signatures if available, else fall back to v1
    try:
        from binascii import hexlify
        certs_v2 = a.get_certificates_der_v2()
        signatures = [hexlify(c).decode() for c in certs_v2] if certs_v2 else []
    except Exception:
        signatures = []

    if not signatures:
        try:
            signatures = [s.hex() for s in a.get_signatures()]
        except Exception:
            signatures = []

    return {
        "file_name": os.path.basename(apk_path),
        "apk_size_bytes": os.path.getsize(apk_path),
        "app_name": a.get_app_name() or "",
        "package_name": a.get_package() or "",
        "version_name": a.get_androidversion_name() or "",
        "version_code": a.get_androidversion_code() or "",
        "min_sdk": a.get_min_sdk_version() or "",
        "target_sdk": a.get_target_sdk_version() or "",
        "permissions": list(a.get_permissions() or []),
        "activities": list(a.get_activities() or []),
        "services": list(a.get_services() or []),
        "receivers": list(a.get_receivers() or []),
        "providers": list(a.get_providers() or []),
        "main_activity": a.get_main_activity() or "",
        "signatures": signatures,
    }
