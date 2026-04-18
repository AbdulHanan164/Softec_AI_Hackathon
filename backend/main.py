from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from backend.schemas import AnalysisRequest, AnalysisResponse
from backend.services.pipeline import run_pipeline
from backend.services.resume_extractor import extract_profile_from_resume
from backend.sample_data import SAMPLE_EMAILS
from backend.routers.auth import router as auth_router

app = FastAPI(
    title="Opportunity Inbox Copilot",
    description="AI-powered email opportunity parser and ranker for university students",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth routes ───────────────────────────────────────────────────────────────
app.include_router(auth_router)


# ── Core API ──────────────────────────────────────────────────────────────────
@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze(req: AnalysisRequest):
    if not req.emails:
        raise HTTPException(status_code=400, detail="No emails provided")
    if len(req.emails) > 15:
        raise HTTPException(status_code=400, detail="Maximum 15 emails supported")
    try:
        return run_pipeline(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sample-emails")
def get_sample_emails():
    return [e.model_dump() for e in SAMPLE_EMAILS]


@app.post("/api/extract-profile")
async def extract_profile(file: UploadFile = File(...)):
    allowed = {".pdf", ".docx", ".doc", ".txt"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'. Use PDF, DOCX, or TXT.")
    try:
        content = await file.read()
        profile = extract_profile_from_resume(file.filename or "resume.pdf", content)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {e}")


@app.post("/api/debug-extract")
async def debug_extract(file: UploadFile = File(...)):
    """Debug endpoint — returns raw text + regex results without AI call."""
    from backend.services.resume_extractor import (
        extract_text_from_pdf, extract_text_from_docx, extract_text_from_txt,
        _regex_phone, _regex_linkedin, _regex_github, _regex_city, _regex_cgpa, _regex_name
    )
    import os as _os
    ext  = _os.path.splitext(file.filename or '')[1].lower()
    data = await file.read()
    if ext == '.pdf':
        text = extract_text_from_pdf(data)
    elif ext in ('.docx', '.doc'):
        text = extract_text_from_docx(data)
    else:
        text = extract_text_from_txt(data)
    return {
        "chars": len(text),
        "preview": text[:600],
        "regex": {
            "name":     _regex_name(text),
            "phone":    _regex_phone(text),
            "linkedin": _regex_linkedin(text),
            "github":   _regex_github(text),
            "city":     _regex_city(text),
            "cgpa":     _regex_cgpa(text),
        }
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ── Serve built React frontend (production) ───────────────────────────────────
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))
