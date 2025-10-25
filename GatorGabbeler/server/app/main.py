import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from .services.llm import generate_spanish_reply

# Load environment variables from .env file
load_dotenv()

# Configure CORS
app = FastAPI(title="GatorGabbeler API", version="1.0.0")
# Allow CORS from all origins for development purposes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model
class ChatRequest(BaseModel):
    message: str
# Define response model
class ChatResponse(BaseModel):
    response: str

# Define the /chat endpoint

@app.post("/api/chat", response_model=ChatResponse)
# function to handle chat requests
async def chat(req: ChatRequest):
    msg = (req.message or "").strip()
    # Validate that the message is not empty
    if not msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    # Generate Spanish reply using the LLM service
    try:
        reply = await generate_spanish_reply(req.message)
        return ChatResponse(response=reply)
    # Handle exceptions and return a 500 error if something goes wrong
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))