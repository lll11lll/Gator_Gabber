from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import FileResponse # Ensure this is imported for index.html fallback
import os

# Import the 'generate_translation' function
from .services.llm import generate_spanish_reply, generate_translation
# RAG: Import RAG utilities
from .rag import get_spn1130_store

app = FastAPI()

# Configure CORS for production deployment
# Add your Vercel/Netlify frontend URL to allowed origins
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://gatorgabber.vercel.app",  # Your actual Vercel URL
    "https://gator-gabber.vercel.app",
    "https://gatorgabber-*.vercel.app",  # Allow preview deployments
    "https://gator-gabber-*.vercel.app",
]

# Allow CORS for deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class ChatRequest(BaseModel):
    message: str
    #  Add 'context' field to the chat request model
    context: str | None = None

class ChatResponse(BaseModel):
    response: str

# Pydantic model for the new translation request
class TranslateRequest(BaseModel):
    text: str
    target_language: str = "English"

#Pydantic model for the new translation response
class TranslateResponse(BaseModel):
    translation: str

# --- API Endpoints ---

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    msg = (req.message or "").strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Missing 'message'")

    try:
        # Pass the received 'context' to the LLM service
        reply = await generate_spanish_reply(msg, req.context) 
        return ChatResponse(response=reply)
    except Exception as e:
        print(f"LLM Error: {e}")
        raise HTTPException(status_code=500, detail=f"LLM failure: {e}")

# New endpoint to handle translation requests
@app.post("/api/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    try:
        translation = await generate_translation(req.text, req.target_language)
        return TranslateResponse(translation=translation)
    except Exception as e:
        print(f"Translation Error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failure: {e}")

# RAG: Health check endpoint for RAG system
@app.get("/api/rag/status")
async def rag_status():
    """Check if RAG system is ready and working."""
    try:
        store = get_spn1130_store()
        
        # Check if vector store exists
        has_index = store.vector_store is not None
        
        # Count PDF files
        pdf_count = len(list(store.data_dir.glob("*.pdf"))) if store.data_dir.exists() else 0
        
        # Try a test search
        can_search = False
        if has_index:
            try:
                results = store.similarity_search("test", k=1)
                can_search = len(results) > 0
            except:
                pass
        
        return {
            "status": "ready" if (has_index and can_search) else "not_ready",
            "has_vector_store": has_index,
            "pdf_count": pdf_count,
            "can_search": can_search,
            "data_directory": str(store.data_dir),
            "index_path": str(store.index_path)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

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

# Fallback for client-side routing 
@app.get("/{full_path:path}")
async def read_index(full_path: str):
    index_path = static_files_dir / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="index.html not found")
    return FileResponse(index_path)