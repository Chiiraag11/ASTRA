"""
ASTRA Risk Scoring Engine
Rule-based risk scoring for APK analysis.
"""
from typing import Dict, Any, List, Tuple

# ── Dangerous permission sets ─────────────────────────────────────────────────

DANGEROUS_PERMISSIONS: Dict[str, int] = {
    "android.permission.READ_SMS": 25,
    "android.permission.RECEIVE_SMS": 20,
    "android.permission.SEND_SMS": 20,
    "android.permission.SYSTEM_ALERT_WINDOW": 20,
    "android.permission.BIND_ACCESSIBILITY_SERVICE": 25,
    "android.permission.READ_CONTACTS": 15,
    "android.permission.WRITE_CONTACTS": 15,
    "android.permission.READ_CALL_LOG": 20,
    "android.permission.REQUEST_INSTALL_PACKAGES": 20,

    # Reduced false positives for genuine banking apps
    "android.permission.READ_PHONE_STATE": 3,
    "android.permission.READ_PHONE_NUMBERS": 5,
    "android.permission.PROCESS_OUTGOING_CALLS": 15,
    "android.permission.RECORD_AUDIO": 10,
    "android.permission.CAMERA": 10,
    "android.permission.ACCESS_FINE_LOCATION": 3,
    "android.permission.ACCESS_BACKGROUND_LOCATION": 10,
    "android.permission.READ_EXTERNAL_STORAGE": 2,
    "android.permission.WRITE_EXTERNAL_STORAGE": 2,
    "android.permission.MANAGE_EXTERNAL_STORAGE": 15,
    "android.permission.RECEIVE_BOOT_COMPLETED": 2,
    "android.permission.USE_FULL_SCREEN_INTENT": 10,
    "android.permission.DISABLE_KEYGUARD": 15,
    "android.permission.CHANGE_NETWORK_STATE": 5,
    "android.permission.MOUNT_UNMOUNT_FILESYSTEMS": 15,
    "android.permission.INSTALL_PACKAGES": 25,
    "android.permission.DELETE_PACKAGES": 20,
    "android.permission.READ_CLIPBOARD": 10,
    "android.permission.GET_TASKS": 10,
    "android.permission.FOREGROUND_SERVICE": 1,
}

# ── Banking-related keywords ──────────────────────────────────────────────────

BANKING_KEYWORDS = [
    "sbi", "hdfc", "icici", "axis", "kotak", "pnb", "canara", "boi", "ubi",
    "yono", "imobile", "bhim", "paytm", "phonepe", "googlepay", "amazonpay",
    "bank", "banking", "netbanking", "mobilebankingapp", "mobilebank",
    "fintech", "wallet", "upi", "neft", "rtgs",
]

IMPERSONATION_INDICATORS = [
    "fake", "mod", "clone", "unofficial", "crack", "hack", "premium",
    "pro_free", "unlocked", "patched",
]

SUSPICIOUS_PACKAGE_PATTERNS = [
    "org.telegram",
    "com.whatsapp.mod",
    "com.instagram.mod",
]

# Known genuine banking / payment package prefixes
KNOWN_BANK_PACKAGES = [
    "com.rblbank",
    "com.sbi",
    "com.hdfcbank",
    "com.icicibank",
    "com.axisbank",
    "com.kotak",
    "com.phonepe",
    "net.one97.paytm",
]


def _score_permissions(permissions: List[str]) -> Tuple[int, List[str]]:
    """Score based on dangerous permissions present."""
    score = 0
    flags = []

    for perm in permissions:
        pts = DANGEROUS_PERMISSIONS.get(perm, 0)
        if pts:
            score += pts
            flags.append(
                f"Dangerous permission: {perm.split('.')[-1]} (+{pts})"
            )

    return min(score, 80), flags


def _score_package(package_name: str, app_name: str) -> Tuple[int, List[str]]:
    """Score based on package/app name analysis."""
    score = 0
    flags = []

    pkg_lower = package_name.lower()
    name_lower = app_name.lower()

    # Banking app detected (informational only)
    for kw in BANKING_KEYWORDS:
        if kw in pkg_lower or kw in name_lower:
            flags.append(f"Banking application detected: '{kw}'")
            break

    # Impersonation indicators
    for ind in IMPERSONATION_INDICATORS:
        if ind in pkg_lower or ind in name_lower:
            score += 20
            flags.append(
                f"Impersonation indicator: '{ind}' (+20)"
            )
            break

    # Suspicious package patterns
    for pat in SUSPICIOUS_PACKAGE_PATTERNS:
        if pkg_lower.startswith(pat) and pat not in [
            "com.whatsapp",
            "org.telegram.messenger"
        ]:
            score += 10
            flags.append(
                f"Suspicious package pattern: '{pat}' (+10)"
            )
            break

    # Banking app name but suspicious package
    if any(kw in name_lower for kw in BANKING_KEYWORDS):

        is_known_bank = any(
            pkg_lower.startswith(pkg)
            for pkg in KNOWN_BANK_PACKAGES
        )

        if not is_known_bank:
            if not any(
                kw in pkg_lower
                for kw in BANKING_KEYWORDS
            ):
                score += 15
                flags.append(
                    "Banking app name does not match expected package (+15)"
                )

    return min(score, 40), flags


def _score_signatures(signatures: List[str]) -> Tuple[int, List[str]]:
    """Score based on signature presence/absence."""
    if not signatures:
        return (
            25,
            ["No digital signature found — app not properly signed (+25)"]
        )

    return 0, []


def _score_services(
    services: List[str],
    receivers: List[str]
) -> Tuple[int, List[str]]:
    """Score based on suspicious services/receivers."""

    score = 0
    flags = []

    combined = [s.lower() for s in services + receivers]

    suspicious = {
        "sms": ("SMS interception service", 15),
        "overlay": ("Overlay/screen capture service", 20),
        "accessibility": ("Accessibility service abuse", 20),
        "keylog": ("Potential keylogger service", 25),
        "screenshot": ("Screenshot service", 15),
        "clip": ("Clipboard monitoring", 10),
        "notif": ("Notification listener", 5),
    }

    for keyword, (msg, pts) in suspicious.items():
        if any(keyword in s for s in combined):
            score += pts
            flags.append(f"{msg} detected (+{pts})")

    return min(score, 40), flags


def calculate_risk(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate risk score (0–100) and verdict from APK metadata.
    """

    permissions = metadata.get("permissions", [])
    package_name = metadata.get("package_name", "")
    app_name = metadata.get("app_name", "")
    signatures = metadata.get("signatures", [])
    services = metadata.get("services", [])
    receivers = metadata.get("receivers", [])

    perm_score, perm_flags = _score_permissions(permissions)
    pkg_score, pkg_flags = _score_package(package_name, app_name)
    sig_score, sig_flags = _score_signatures(signatures)
    svc_score, svc_flags = _score_services(services, receivers)

    total = perm_score + pkg_score + sig_score + svc_score

    risk_score = max(0, min(100, total))

    if risk_score >= 65:
        verdict = "Malicious"
    elif risk_score >= 35:
        verdict = "Suspicious"
    else:
        verdict = "Safe"

    all_flags = (
        perm_flags +
        pkg_flags +
        sig_flags +
        svc_flags
    )

    return {
        "risk_score": risk_score,
        "verdict": verdict,
        "flags": all_flags,
        "permission_score": perm_score,
        "package_score": pkg_score,
        "signature_score": sig_score,
        "behavior_score": svc_score,
        "dangerous_permissions": [
            p for p in permissions
            if p in DANGEROUS_PERMISSIONS
        ],
    }