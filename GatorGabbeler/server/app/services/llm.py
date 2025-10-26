import os
from dotenv import load_dotenv
from .providers.openai_provider import call_openai
from ..config.system_prompt import get_system_prompt
from ..rag import retrieve_context, format_rag_prompt
load_dotenv()

async def generate_spanish_reply(user_message: str, context: str | None = None) -> str:
    """
    Generates a Spanish reply using the "Alberto" persona and class context.
    Now with RAG support for SPN1130.
    """
    
    system_prompt = get_system_prompt(context)
    augmented_message = user_message
    
    # --- RAG Enhancement (only for SPN1130) ---
    if context == "spanish_1130":
        try:
            rag_context = retrieve_context(user_message, context)
            if rag_context:
                system_prompt, augmented_message = format_rag_prompt(
                    system_prompt, 
                    user_message, 
                    rag_context
                )
                print("RAG: Enhanced prompt with course materials")
        except Exception as e:
            print(f"RAG: Failed to retrieve context, continuing without RAG: {e}")

    # --- Call LLM Provider ---
    if os.getenv("OPENAI_API_KEY"):
        return await call_openai(system_prompt, augmented_message)

    raise RuntimeError("No LLM provider configured. Set OPENAI_API_KEY.")


async def generate_translation(text: str, target_language: str) -> str:
    """
    Translates text into the target language using a generic prompt.
    """
    
    system_prompt = f"You are a helpful translation assistant. Translate the following text into {target_language}. Respond with ONLY the translation and nothing else."
    user_message = text

    # --- Call LLM Provider ---
    if os.getenv("OPENAI_API_KEY"):
        return await call_openai(system_prompt, user_message)

    raise RuntimeError("No LLM provider configured for translation. Set OPENAI_API_KEY.")