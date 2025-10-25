from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import FileResponse # Ensure this is imported for index.html fallback

# ADDED - Feature 1: Import the new 'generate_translation' function
from .services.llm import generate_spanish_reply, generate_translation

app = FastAPI()

# --- Pydantic Models ---

class ChatRequest(BaseModel):
    message: str
    # ADDED - Feature 2: Add 'context' field to the chat request model
    context: str | None = None

class ChatResponse(BaseModel):
    response: str

# ADDED - Feature 1: Pydantic model for the new translation request
class TranslateRequest(BaseModel):
    text: str
    target_language: str = "English"

# ADDED - Feature 1: Pydantic model for the new translation response
class TranslateResponse(BaseModel):
    translation: str

# --- API Endpoints ---

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    msg = (req.message or "").strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Missing 'message'")

    try:
        # ADDED - Feature 2: Pass the received 'context' to the LLM service
        reply = await generate_spanish_reply(msg, req.context) 
        return ChatResponse(response=reply)
    except Exception as e:
        print(f"LLM Error: {e}")
        raise HTTPException(status_code=500, detail=f"LLM failure: {e}")

# ADDED - Feature 1: New endpoint to handle translation requests
@app.post("/api/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    try:
        translation = await generate_translation(req.text, req.target_language)
        return TranslateResponse(translation=translation)
    except Exception as e:
        print(f"Translation Error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failure: {e}")

# --- Static Files (Vite Frontend) ---

static_files_dir = Path(__file__).parent.parent.parent / "client" / "dist"

if static_files_dir.exists():
    app.mount(
        "/",
        StaticFiles(directory=static_files_dir, html=True),
        name="static",
    )
else:
    print(f"Warning: Static files directory not found at {static_files_dir}")

# Fallback for client-side routing (if you add it later)
@app.get("/{full_path:path}")
async def read_index(full_path: str):
    index_path = static_files_dir / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="index.html not found")
    return FileResponse(index_path)