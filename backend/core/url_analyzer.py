"""
ASTRA URL Analysis Engine
Rule-based URL risk scoring.
"""
import re
from typing import Dict, Any
from urllib.parse import urlparse

SUSPICIOUS_TLDS = {".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".pw", ".top", ".click"}

PHISHING_KEYWORDS = [
    "login", "signin", "verify", "account", "secure", "banking", "update",
    "confirm", "suspend", "limited", "alert", "unusual", "activity", "password",
    "credential", "paypal", "amazon", "google", "microsoft", "apple", "netflix",
    "bank", "wallet", "crypto", "bitcoin", "recovery", "support",
]

KNOWN_MALICIOUS_PATTERNS = [
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",   # raw IP address
    r"bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly",   # URL shorteners
]

SAFE_DOMAINS = {
    "google.com", "play.google.com", "apple.com", "apps.apple.com",
    "microsoft.com", "github.com", "stackoverflow.com", "wikipedia.org",
}


def analyze_url(url: str) -> Dict[str, Any]:
    """
    Analyze a URL for phishing/malware indicators.

    Returns:
        {
            "url": str,
            "malicious": bool,
            "risk_score": int (0-100),
            "verdict": "Safe" | "Suspicious" | "Malicious",
            "flags": List[str],
        }
    """
    flags = []
    score = 0

    try:
        parsed = urlparse(url if url.startswith(("http://", "https://")) else "http://" + url)
        hostname = parsed.hostname or ""
        path     = (parsed.path + "?" + parsed.query).lower() if parsed.query else parsed.path.lower()
    except Exception:
        return {
            "url": url,
            "malicious": True,
            "risk_score": 100,
            "verdict": "Malicious",
            "flags": ["Could not parse URL"],
        }

    # Check against known safe domains
    for safe in SAFE_DOMAINS:
        if hostname == safe or hostname.endswith("." + safe):
            return {
                "url": url,
                "malicious": False,
                "risk_score": 0,
                "verdict": "Safe",
                "flags": ["Known safe domain"],
            }

    # HTTP (not HTTPS)
    if url.startswith("http://"):
        score += 15
        flags.append("Not using HTTPS (+15)")

    # Suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if hostname.endswith(tld):
            score += 20
            flags.append(f"Suspicious TLD '{tld}' (+20)")
            break

    # Raw IP address
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", hostname):
        score += 30
        flags.append("Raw IP address used instead of domain (+30)")

    # Known malicious patterns
    for pat in KNOWN_MALICIOUS_PATTERNS:
        if re.search(pat, url, re.IGNORECASE):
            score += 20
            flags.append(f"Matches suspicious pattern: {pat} (+20)")
            break

    # Phishing keywords in path/query
    found_kw = [kw for kw in PHISHING_KEYWORDS if kw in path or kw in hostname]
    if found_kw:
        pts = min(len(found_kw) * 8, 30)
        score += pts
        flags.append(f"Phishing keywords found: {', '.join(found_kw[:3])} (+{pts})")

    # Excessive subdomains
    subdomain_count = hostname.count(".")
    if subdomain_count >= 4:
        score += 15
        flags.append(f"Excessive subdomains ({subdomain_count}) (+15)")

    # Long URL
    if len(url) > 150:
        score += 10
        flags.append(f"Unusually long URL ({len(url)} chars) (+10)")

    # Mixed characters (homograph attack)
    if re.search(r"[^\x00-\x7F]", hostname):
        score += 25
        flags.append("Non-ASCII characters in domain (possible homograph attack) (+25)")

    risk_score = max(0, min(100, score))

    if risk_score >= 65:
        verdict = "Malicious"
    elif risk_score >= 30:
        verdict = "Suspicious"
    else:
        verdict = "Safe"

    return {
        "url": url,
        "malicious": risk_score >= 65,
        "risk_score": risk_score,
        "verdict": verdict,
        "flags": flags,
    }
