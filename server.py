import os
import json
import glob
import asyncio
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from core.pipeline import generate_portfolio_assets, slugify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXPORTS_DIR = os.path.join(BASE_DIR, "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

app = FastAPI(title="Portfolio Showcase Generator", version="1.0.0")

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
async def health_check():
    return {"status": "healthy", "service": "portfolio-showcase-generator"}

# Mount static and exports directories
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
app.mount("/exports", StaticFiles(directory=EXPORTS_DIR), name="exports")

templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

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

# In-memory history cache
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

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    try:
        return templates.TemplateResponse(request=request, name="index.html")
    except TypeError:
        return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/generate")
async def generate_showcase(req: GenerateRequest):
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

@app.get("/api/history")
async def get_history():
    return load_history()

@app.get("/api/download/{project}/{filename}")
async def download_file(project: str, filename: str):
    file_path = os.path.join(EXPORTS_DIR, project, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting Portfolio Showcase Generator on http://{host}:{port}")
    uvicorn.run("server:app", host=host, port=port, reload=False)
