# ==============================================================================
# Designed, Planned & Developed by Ejaj Mahmud
# Portfolio Image Generator - Enterprise Web & Asset Automation Pipeline
# Copyright (c) 2026 Shinjiru Technology Sdn. Bhd. All rights reserved.
# ==============================================================================

import os
import json
import base64
import urllib.request
import urllib.parse
import ssl
from typing import Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORTS_DIR = os.path.join(BASE_DIR, "exports")
SYNC_CONFIG_FILE = os.path.join(EXPORTS_DIR, "sync_settings.json")

# Official 22 industries recognized on Shinjiru Web Design Portfolio page
SHINJIRU_INDUSTRIES = [
    "Argiculture & Animals",
    "Automotive & Transportation",
    "Business & Services",
    "Creative & Design",
    "Consultancy",
    "Community",
    "Education",
    "Engineering",
    "Events & Entertainment",
    "Factory & Machinery",
    "Fashion & Beauty",
    "Film & TV",
    "Finance & Law",
    "Food & Drinks",
    "Health & Medical",
    "Logistics",
    "Music & Bands",
    "Oils & Gas & Marine",
    "Printing",
    "Real Estate & Construction",
    "Sport & Fitness",
    "Technology & Apps"
]

SHINJIRU_WEBSITE_TYPES = [
    "Business",
    "E-commerce",
    "Consultancy"
]

INDUSTRY_NORMALIZATION = {
    "food & baverage": "Food & Drinks",
    "food & beverage": "Food & Drinks",
    "food and beverage": "Food & Drinks",
    "food & drinks": "Food & Drinks",
    "food": "Food & Drinks",
    "logistic": "Logistics",
    "logistics": "Logistics",
    "argiculture & animals": "Argiculture & Animals",
    "agriculture & animals": "Argiculture & Animals",
    "agriculture": "Argiculture & Animals",
    "argiculture": "Argiculture & Animals",
    "automotive & transportation": "Automotive & Transportation",
    "automotive": "Automotive & Transportation",
    "transportation": "Automotive & Transportation",
    "business & services": "Business & Services",
    "creative & design": "Creative & Design",
    "creative": "Creative & Design",
    "design": "Creative & Design",
    "consultancy": "Consultancy",
    "community": "Community",
    "education": "Education",
    "engineering": "Engineering",
    "events & entertainment": "Events & Entertainment",
    "events": "Events & Entertainment",
    "entertainment": "Events & Entertainment",
    "factory & machinery": "Factory & Machinery",
    "factory": "Factory & Machinery",
    "machinery": "Factory & Machinery",
    "fashion & beauty": "Fashion & Beauty",
    "fashion": "Fashion & Beauty",
    "beauty": "Fashion & Beauty",
    "film & tv": "Film & TV",
    "film": "Film & TV",
    "finance & law": "Finance & Law",
    "finance": "Finance & Law",
    "law": "Finance & Law",
    "health & medical": "Health & Medical",
    "health": "Health & Medical",
    "medical": "Health & Medical",
    "music & bands": "Music & Bands",
    "music": "Music & Bands",
    "oils & gas & marine": "Oils & Gas & Marine",
    "oil & gas": "Oils & Gas & Marine",
    "oils & gas": "Oils & Gas & Marine",
    "printing": "Printing",
    "real estate & construction": "Real Estate & Construction",
    "real estate": "Real Estate & Construction",
    "construction": "Real Estate & Construction",
    "sport & fitness": "Sport & Fitness",
    "sports": "Sport & Fitness",
    "fitness": "Sport & Fitness",
    "technology & apps": "Technology & Apps",
    "technology": "Technology & Apps",
    "tech": "Technology & Apps"
}

def normalize_industry(cat: Optional[str]) -> str:
    """
    Normalizes any user-typed or imported category to match Shinjiru's exact 22 filter options.
    """
    if not cat:
        return "Business & Services"
    raw = cat.strip()
    cleaned = raw.lower()
    if raw in SHINJIRU_INDUSTRIES:
        return raw
    for pattern, target in INDUSTRY_NORMALIZATION.items():
        if cleaned == pattern or cleaned.startswith(pattern) or pattern in cleaned:
            return target
    return raw

def normalize_website_type(wt: Optional[str]) -> str:
    """
    Normalizes website type to match Shinjiru's filter options (Business, E-commerce, Consultancy).
    """
    if not wt:
        return "Business"
    cleaned = wt.strip().lower()
    if "e-comm" in cleaned or "ecommerce" in cleaned or "shop" in cleaned or "store" in cleaned:
        return "E-commerce"
    if "consult" in cleaned:
        return "Consultancy"
    return "Business"

DEFAULT_SETTINGS = {
    "target_site": "https://wwwdev.shinjiru.com.my",
    "portfolio_page_url": "https://wwwdev.shinjiru.com.my/web-design/web-design-portfolios/",
    "sync_endpoint": "https://wwwdev.shinjiru.com.my/wp-json/shinjiru-portfolio/v1/sync",
    "rollback_endpoint": "https://wwwdev.shinjiru.com.my/wp-json/shinjiru-portfolio/v1/rollback",
    "health_endpoint": "https://wwwdev.shinjiru.com.my/wp-json/shinjiru-portfolio/v1/health",
    "secret_token": "shj_fd3a62ff2a7a5a60f110b4e2e028bdc6b830b9374cdf2ad2",
    "auto_publish_on_approve": True
}

def get_sync_settings() -> Dict[str, Any]:
    os.makedirs(EXPORTS_DIR, exist_ok=True)
    if os.path.exists(SYNC_CONFIG_FILE):
        try:
            with open(SYNC_CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                settings = dict(DEFAULT_SETTINGS)
                settings.update(saved)
                return settings
        except Exception:
            return dict(DEFAULT_SETTINGS)
    return dict(DEFAULT_SETTINGS)

def save_sync_settings(new_settings: Dict[str, Any]) -> Dict[str, Any]:
    current = get_sync_settings()
    current.update(new_settings)
    os.makedirs(EXPORTS_DIR, exist_ok=True)
    with open(SYNC_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(current, f, indent=2)
    return current

def _get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def check_sync_health() -> Dict[str, Any]:
    settings = get_sync_settings()
    endpoint = settings.get("health_endpoint")
    token = settings.get("secret_token")
    
    try:
        req = urllib.request.Request(
            endpoint,
            headers={
                "User-Agent": "PortfolioStudio/1.0",
                "X-Shinjiru-Sync-Token": token
            }
        )
        with urllib.request.urlopen(req, context=_get_ssl_context(), timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {
                "success": True,
                "status_code": resp.status,
                "data": data,
                "target_site": settings.get("target_site"),
                "portfolio_page_url": settings.get("portfolio_page_url")
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "target_site": settings.get("target_site")
        }

def sync_showcase_to_shinjiru(
    slug: str,
    title: str,
    url: str,
    industry: str,
    website_type: str,
    webp_path: str
) -> Dict[str, Any]:
    """
    Uploads and syncs an approved showcase to Shinjiru Web Design Portfolio.
    """
    settings = get_sync_settings()
    sync_url = settings.get("sync_endpoint")
    token = settings.get("secret_token")

    if not os.path.exists(webp_path):
        raise FileNotFoundError(f"Portfolio WebP asset not found at: {webp_path}")

    with open(webp_path, "rb") as img_f:
        webp_bytes = img_f.read()
        b64_str = base64.b64encode(webp_bytes).decode("utf-8")

    norm_industry = normalize_industry(industry)
    norm_type = normalize_website_type(website_type)

    payload = {
        "title": title.strip(),
        "url": url.strip(),
        "industry": norm_industry,
        "website_type": norm_type,
        "slug": slug.strip(),
        "image_base64": b64_str
    }

    req = urllib.request.Request(
        sync_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Shinjiru-Sync-Token": token,
            "User-Agent": "PortfolioStudio/1.0"
        }
    )

    with urllib.request.urlopen(req, context=_get_ssl_context(), timeout=3) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        res["portfolio_page_url"] = settings.get("portfolio_page_url")
        return res

def rollback_showcase_from_shinjiru(slug: str) -> Dict[str, Any]:
    """
    Rolls back and unpublishes a showcase from Shinjiru Web Design Portfolio.
    """
    settings = get_sync_settings()
    rb_url = settings.get("rollback_endpoint")
    token = settings.get("secret_token")

    payload = {"slug": slug.strip()}

    req = urllib.request.Request(
        rb_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Shinjiru-Sync-Token": token,
            "User-Agent": "PortfolioStudio/1.0"
        }
    )

    with urllib.request.urlopen(req, context=_get_ssl_context(), timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))
