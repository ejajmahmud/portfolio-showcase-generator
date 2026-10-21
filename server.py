# ==============================================================================
# Designed, Planned & Developed by Ejaj Mahmud
# Portfolio Image Generator - Enterprise Web & Asset Automation Pipeline
# Copyright (c) 2026 Shinjiru Technology Sdn. Bhd. All rights reserved.
# ==============================================================================

import os
import json
import glob
import shutil
import asyncio
import time
import uuid
import mimetypes
from datetime import datetime, timezone
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException, Depends
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict

# Ensure modern image and document MIME types are explicitly recognized in containerized Linux
mimetypes.init()
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/jpeg", ".jpg")
mimetypes.add_type("image/jpeg", ".jpeg")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("image/x-icon", ".ico")
mimetypes.add_type("application/zip", ".zip")
mimetypes.add_type("application/json", ".json")

from core.pipeline import generate_portfolio_assets, slugify
from core.auth import (
    init_auth,
    authenticate_user,
    create_token,
    verify_token,
    get_user,
    list_users,
    create_user,
    update_user,
    delete_user,
    ROLES,
    ROLE_PERMISSIONS
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXPORTS_DIR = os.path.join(BASE_DIR, "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

# Initialize authentication persistence & default admin
init_auth()

app = FastAPI(title="Portfolio Showcase Studio", version="1.1.0")

# Enable CORS for public access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check for cloud deployment platforms (Render, Railway, Docker, AWS, etc.)
@app.get("/health")
@app.head("/health")
async def health_check():
    return {"status": "healthy", "service": "portfolio-showcase-generator"}

# Favicon endpoint
@app.get("/favicon.ico", include_in_schema=False)
@app.head("/favicon.ico", include_in_schema=False)
async def get_favicon():
    return FileResponse(os.path.join(BASE_DIR, "static", "img", "favicon.ico"), media_type="image/x-icon")

# Mount static and exports directories
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
app.mount("/exports", StaticFiles(directory=EXPORTS_DIR), name="exports")

# ACME Challenge for automated SSL certificate issuance
ACME_DIR = os.environ.get("ACME_DIR", os.path.join(BASE_DIR, "acme-challenge"))
os.makedirs(ACME_DIR, exist_ok=True)
app.mount("/.well-known/acme-challenge", StaticFiles(directory=ACME_DIR), name="acme-challenge")

templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# --- Pydantic Request Models ---
class LoginRequest(BaseModel):
    username: str
    password: str

class CreateUserRequest(BaseModel):
    username: str
    password: str
    role: str = "creator"
    display_name: Optional[str] = None

class UpdateUserRequest(BaseModel):
    password: Optional[str] = None
    role: Optional[str] = None
    display_name: Optional[str] = None
    is_active: Optional[bool] = None

class CreateShowcaseRequest(BaseModel):
    title: str
    url: str
    category: Optional[str] = None
    type: Optional[str] = None
    slug: Optional[str] = None

class UpdateShowcaseRequest(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None

class GenerateRequest(BaseModel):
    url: str
    name: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    mobile_finish: Optional[str] = "deep-blue"
    tablet_finish: Optional[str] = "space-black"
    bg_color: Optional[str] = "#E5E5E5"
    shadow_intensity: Optional[str] = "normal"
    delay: Optional[float] = 2.0
    hide_banners: Optional[bool] = True
    headless: Optional[bool] = True

class BatchGenerateRequest(BaseModel):
    urls: List[str]
    category: Optional[str] = None
    type: Optional[str] = None
    mobile_finish: Optional[str] = "deep-blue"
    tablet_finish: Optional[str] = "space-black"
    bg_color: Optional[str] = "#E5E5E5"
    shadow_intensity: Optional[str] = "normal"
    delay: Optional[float] = 2.5
    headless: Optional[bool] = True

# --- Authentication Helpers & RBAC Dependencies ---
def get_current_user_from_request(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
    if token:
        payload = verify_token(token)
        if payload:
            user = get_user(payload.get("sub", ""))
            if user and user.get("is_active", True):
                return user
    return None

def require_auth(request: Request) -> dict:
    user = get_current_user_from_request(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    return user

def require_role(allowed_roles: List[str]):
    def dependency(request: Request) -> dict:
        user = require_auth(request)
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied: This operation requires one of {allowed_roles} roles. Your role is '{user.get('role')}'."
            )
        return user
    return dependency

# --- History Persistence ---
HISTORY_FILE = os.path.join(EXPORTS_DIR, "history.json")

def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_history(entry):
    history = load_history()
    # Check if slug exists, update or prepend
    history = [h for h in history if h.get("slug") != entry.get("slug")]
    history.insert(0, entry)
    # Keep last 30
    history = history[:30]
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

# --- Frontend Routes ---
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    user = get_current_user_from_request(request)
    if user:
        return RedirectResponse(url="/", status_code=302)
    try:
        return templates.TemplateResponse(request=request, name="login.html")
    except TypeError:
        return templates.TemplateResponse("login.html", {"request": request})

@app.get("/", response_class=HTMLResponse)
@app.head("/")
async def index(request: Request):
    user = get_current_user_from_request(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)
    try:
        return templates.TemplateResponse(request=request, name="index.html", context={"request": request, "user": user})
    except TypeError:
        return templates.TemplateResponse("index.html", {"request": request, "user": user})

# --- Authentication API ---
@app.post("/api/auth/login")
async def api_login(req: LoginRequest, request: Request):
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    token = create_token(user["username"], user["role"], user["display_name"])
    
    response = JSONResponse(content={
        "success": True,
        "user": user,
        "token": token
    })
    is_https = (request.url.scheme == "https") or (request.headers.get("x-forwarded-proto") == "https")
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        max_age=7 * 86400,
        samesite="lax",
        secure=is_https
    )
    return response

@app.post("/api/auth/logout")
async def api_logout():
    response = JSONResponse(content={"success": True})
    response.delete_cookie(key="session_token")
    return response

@app.post("/api/auth/guest-login")
async def api_guest_login(request: Request):
    """
    Guest Authentication: Instantly provisions a guest session with
    creator permissions for showcase generation & browsing, but restricted from deletion.
    """
    guest_user = {
        "username": "guest",
        "role": "guest",
        "display_name": "Guest User"
    }
    token = create_token("guest", "guest")
    is_https = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"
    
    response = JSONResponse(content={
        "success": True,
        "token": token,
        "user": guest_user,
        "redirect": "/"
    })
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        max_age=3 * 86400,
        samesite="lax",
        secure=is_https
    )
    return response

@app.get("/api/auth/me")
async def api_me(request: Request):
    user = require_auth(request)
    perms = ROLE_PERMISSIONS.get(user["role"], {})
    return {
        "user": user,
        "permissions": perms
    }

# --- User Management API (Admin Only) ---
@app.get("/api/users")
async def api_list_users(request: Request):
    require_role(["admin"])(request)
    return list_users()

@app.post("/api/users")
async def api_create_user(req: CreateUserRequest, request: Request):
    require_role(["admin"])(request)
    try:
        user = create_user(
            username=req.username,
            password=req.password,
            role=req.role,
            display_name=req.display_name
        )
        return {"success": True, "user": user}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/users/{username}")
async def api_update_user(username: str, req: UpdateUserRequest, request: Request):
    require_role(["admin"])(request)
    try:
        user = update_user(
            username=username,
            password=req.password,
            role=req.role,
            display_name=req.display_name,
            is_active=req.is_active
        )
        return {"success": True, "user": user}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/users/{username}")
async def api_delete_user(username: str, request: Request):
    current_user = require_role(["admin"])(request)
    if current_user["username"] == username.strip().lower():
        raise HTTPException(status_code=400, detail="Cannot delete your own active administrator account.")
    try:
        success = delete_user(username)
        if not success:
            raise HTTPException(status_code=404, detail="User not found.")
        return {"success": True}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Generation API (Creators, Guests & Admins) ---
@app.post("/api/generate")
async def generate_showcase(req: GenerateRequest, request: Request):
    user = require_role(["admin", "creator", "guest"])(request)
    
    url = req.url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    slug = slugify(req.name or url.split("//")[-1].split("/")[0])
    project_dir = os.path.join(EXPORTS_DIR, slug)
    os.makedirs(project_dir, exist_ok=True)

    try:
        result = await asyncio.to_thread(
            generate_portfolio_assets,
            url=url,
            output_dir=project_dir,
            project_name=req.name,
            category=req.category,
            website_type=req.type,
            mobile_finish=req.mobile_finish or "deep-blue",
            tablet_finish=req.tablet_finish or "space-black",
            bg_color=req.bg_color or "#E5E5E5",
            shadow_intensity=req.shadow_intensity or "normal",
            delay=req.delay if req.delay is not None else 2.0,
            hide_banners=req.hide_banners if req.hide_banners is not None else True,
            headless=req.headless if req.headless is not None else True
        )

        # Convert local paths to relative URLs
        relative_exports = {}
        for key, filepath in result["exports"].items():
            rel = os.path.relpath(filepath, EXPORTS_DIR).replace("\\", "/")
            relative_exports[key] = f"/exports/{rel}"

        history_item = {
            "title": result["title"],
            "slug": result["slug"],
            "url": url,
            "category": result.get("category", ""),
            "type": result.get("type", ""),
            "mobile_finish": req.mobile_finish,
            "exports": relative_exports,
            "created_by": user["username"],
            "created_at": None
        }
        save_history(history_item)

        return {
            "success": True,
            "title": result["title"],
            "slug": result["slug"],
            "url": url,
            "category": result.get("category", ""),
            "type": result.get("type", ""),
            "exports": relative_exports
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- Batch Showcase Generation Engine ---
BATCH_JOBS: Dict[str, dict] = {}

async def run_batch_worker(batch_id: str, req: BatchGenerateRequest, username: str):
    job = BATCH_JOBS.get(batch_id)
    if not job:
        return
    job["status"] = "processing"
    job["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    total = len(job["urls"])
    for idx, raw_url in enumerate(job["urls"]):
        url = raw_url.strip()
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        domain = url.split("//")[-1].split("/")[0]
        title = domain.capitalize()
        base_slug = slugify(domain)
        history_slugs = {h.get("slug") for h in load_history()}
        slug = base_slug
        if slug in history_slugs:
            slug = f"{base_slug}-{int(time.time()) % 10000}"

        project_dir = os.path.join(EXPORTS_DIR, slug)
        os.makedirs(project_dir, exist_ok=True)

        job["current_index"] = idx
        job["current_url"] = url
        job["current_step"] = f"Capturing responsive viewports for {domain}..."
        job["updated_at"] = datetime.now(timezone.utc).isoformat()

        try:
            result = await asyncio.to_thread(
                generate_portfolio_assets,
                url=url,
                output_dir=project_dir,
                project_name=title,
                category=req.category,
                website_type=req.type,
                mobile_finish=req.mobile_finish or "deep-blue",
                tablet_finish=req.tablet_finish or "space-black",
                bg_color=req.bg_color or "#E5E5E5",
                shadow_intensity=req.shadow_intensity or "normal",
                delay=req.delay if req.delay is not None else 2.5,
                hide_banners=True,
                headless=req.headless if req.headless is not None else True
            )

            relative_exports = {}
            for key, filepath in result["exports"].items():
                rel = os.path.relpath(filepath, EXPORTS_DIR).replace("\\", "/")
                relative_exports[key] = f"/exports/{rel}"

            history_item = {
                "title": result["title"],
                "slug": result["slug"],
                "url": url,
                "category": result.get("category", "") or (req.category or ""),
                "type": result.get("type", "") or (req.type or ""),
                "mobile_finish": req.mobile_finish or "deep-blue",
                "exports": relative_exports,
                "created_by": username,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            save_history(history_item)

            job["completed"].append(history_item)
            job["progress"] = int(((idx + 1) / total) * 100)
            job["updated_at"] = datetime.now(timezone.utc).isoformat()

        except Exception as e:
            job["errors"].append({
                "url": url,
                "index": idx,
                "error": str(e)
            })
            job["progress"] = int(((idx + 1) / total) * 100)
            job["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Controlled cool-down between batch captures to ensure Playwright & memory are cleanly cleared
        if idx < total - 1:
            await asyncio.sleep(2.0)

    job["status"] = "completed"
    job["current_step"] = "All batch showcases processed successfully."
    job["updated_at"] = datetime.now(timezone.utc).isoformat()


@app.post("/api/generate-batch")
async def generate_batch_showcase(req: BatchGenerateRequest, request: Request):
    user = require_role(["admin", "creator", "guest"])(request)
    
    cleaned_urls = []
    seen = set()
    for u in req.urls:
        stripped = u.strip()
        if not stripped:
            continue
        if not stripped.startswith("http://") and not stripped.startswith("https://"):
            stripped = "https://" + stripped
        if stripped not in seen:
            seen.add(stripped)
            cleaned_urls.append(stripped)

    if not cleaned_urls:
        raise HTTPException(status_code=400, detail="Please provide at least one valid website URL.")

    if len(cleaned_urls) > 15:
        raise HTTPException(status_code=400, detail="Batch mode is limited to 15 websites per run to preserve server stability.")

    batch_id = f"batch_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    BATCH_JOBS[batch_id] = {
        "batch_id": batch_id,
        "status": "pending",
        "total": len(cleaned_urls),
        "urls": cleaned_urls,
        "current_index": 0,
        "current_url": cleaned_urls[0],
        "current_step": "Initializing batch queue...",
        "progress": 0,
        "completed": [],
        "errors": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    asyncio.create_task(run_batch_worker(batch_id, req, user["username"]))

    return {
        "success": True,
        "batch_id": batch_id,
        "total": len(cleaned_urls)
    }


@app.get("/api/batch/{batch_id}")
async def get_batch_status(batch_id: str, request: Request):
    require_auth(request)
    job = BATCH_JOBS.get(batch_id)
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found.")
    return job


@app.get("/api/batch/{batch_id}/events")
async def stream_batch_events(batch_id: str, request: Request):
    require_auth(request)
    job = BATCH_JOBS.get(batch_id)
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found.")

    async def sse_generator():
        last_completed_count = -1
        last_error_count = -1
        last_step = ""
        while True:
            if await request.is_disconnected():
                break

            j = BATCH_JOBS.get(batch_id)
            if not j:
                break

            curr_completed = len(j.get("completed", []))
            curr_errors = len(j.get("errors", []))
            curr_step = j.get("current_step", "")
            status = j.get("status", "pending")

            if curr_completed != last_completed_count or curr_errors != last_error_count or curr_step != last_step or status == "completed":
                last_completed_count = curr_completed
                last_error_count = curr_errors
                last_step = curr_step

                data_str = json.dumps(j)
                yield f"data: {data_str}\n\n"

            if status == "completed":
                break

            await asyncio.sleep(0.5)

    return StreamingResponse(sse_generator(), media_type="text/event-stream")

# --- History & Showcase CRUD API ---
@app.get("/api/history")
async def get_history(request: Request):
    require_auth(request)
    return load_history()

@app.post("/api/history")
async def create_history_showcase(req: CreateShowcaseRequest, request: Request):
    user = require_role(["admin", "creator", "guest"])(request)
    url = req.url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    slug = req.slug or slugify(req.title or url.split("//")[-1].split("/")[0])
    history = load_history()
    
    # Check if slug exists
    for h in history:
        if h.get("slug") == slug:
            raise HTTPException(status_code=400, detail=f"A showcase with slug '{slug}' already exists.")

    new_item = {
        "title": req.title.strip(),
        "slug": slug,
        "url": url,
        "category": req.category or "",
        "type": req.type or "",
        "mobile_finish": "deep-blue",
        "exports": {},
        "created_by": user.get("username", "admin"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    history.insert(0, new_item)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)
    return {"success": True, "showcase": new_item}

@app.get("/api/history/{slug}")
async def get_history_showcase(slug: str, request: Request):
    require_auth(request)
    history = load_history()
    for h in history:
        if h.get("slug") == slug:
            return h
    raise HTTPException(status_code=404, detail="Showcase not found.")

@app.put("/api/history/{slug}")
async def update_history_showcase(slug: str, req: UpdateShowcaseRequest, request: Request):
    user = require_role(["admin", "creator"])(request)
    history = load_history()
    target = None
    for h in history:
        if h.get("slug") == slug:
            target = h
            break

    if not target:
        raise HTTPException(status_code=404, detail="Showcase not found.")

    if req.title is not None:
        target["title"] = req.title.strip()
    if req.url is not None:
        raw_url = req.url.strip()
        if raw_url and not raw_url.startswith("http://") and not raw_url.startswith("https://"):
            raw_url = "https://" + raw_url
        target["url"] = raw_url
    if req.category is not None:
        target["category"] = req.category.strip()
    if req.type is not None:
        target["type"] = req.type.strip()
    target["updated_at"] = datetime.now(timezone.utc).isoformat()

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return {"success": True, "showcase": target}

@app.delete("/api/history/{slug}")
async def delete_history_showcase(slug: str, request: Request):
    user = require_auth(request)
    if user.get("role") == "guest":
        raise HTTPException(
            status_code=403,
            detail="Guest accounts do not have permission to delete showcases. Please sign in with an Administrator account."
        )
    if user.get("role") not in ["admin", "creator"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Delete operation requires Administrator or Creator role."
        )
    history = load_history()
    target = None
    new_history = []
    for h in history:
        if h.get("slug") == slug:
            target = h
        else:
            new_history.append(h)

    if not target:
        raise HTTPException(status_code=404, detail="Showcase not found.")

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(new_history, f, indent=2)

    # Safely remove project files from disk if they exist
    project_dir = os.path.join(EXPORTS_DIR, slug)
    if os.path.exists(project_dir) and os.path.isdir(project_dir):
        try:
            shutil.rmtree(project_dir)
        except Exception as e:
            print(f"Warning: could not delete directory {project_dir}: {e}")

    return {"success": True, "deleted": slug}

@app.get("/api/download/{project}/{filename}")
async def download_file(project: str, filename: str, request: Request):
    require_auth(request)
    file_path = os.path.join(EXPORTS_DIR, project, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting Portfolio Showcase Studio on http://{host}:{port}")
    uvicorn.run("server:app", host=host, port=port, reload=False)
