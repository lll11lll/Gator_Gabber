import os
from dotenv import load_dotenv
from .providers.openai_provider import call_openai, call_openai_vision
from ..config.system_prompt import get_system_prompt
from ..rag import retrieve_context, format_rag_prompt

load_dotenv()

# ============================================================================
# LLM Service Functions
# ============================================================================

async def generate_spanish_reply(
    user_message: str, 
    context: str | None = None,
    image_base64: str | None = None
) -> str:
    """
    Generate a Spanish reply using the "Alberto" persona with optional image support.
    
    Args:
        user_message: User's text message
        context: Class context (e.g., "spanish_1130", "default")
        image_base64: Optional Base64-encoded image with data URL prefix
        
    Returns:
        AI-generated Spanish response
        
    Features:
        - RAG support for SPN1130 (text-only conversations)
        - Vision API for image analysis (when image provided)
        - Context-aware responses based on class level
        
    Note:
        RAG is disabled when processing images to focus on visual content.
    """
    system_prompt = get_system_prompt(context)
    augmented_message = user_message
    
    # RAG Enhancement (only for text-only SPN1130 conversations)
    if context == "spanish_1130" and not image_base64:
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

    # Check for API key
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("No LLM provider configured. Set OPENAI_API_KEY.")
    
    # Route to appropriate API based on whether image is present
    if image_base64:
        print("Using vision model for image analysis")
        return await call_openai_vision(system_prompt, augmented_message, image_base64)
    else:
        return await call_openai(system_prompt, augmented_message)


async def generate_translation(text: str, target_language: str) -> str:
    """
    Translate text into the target language.
    
    Args:
        text: Text to translate
        target_language: Target language (e.g., "English", "Spanish")
        
    Returns:
        Translated text
    """
    system_prompt = (
        f"You are a helpful translation assistant. "
        f"Translate the following text into {target_language}. "
        f"Respond with ONLY the translation and nothing else."
    )
    user_message = text

    if os.getenv("OPENAI_API_KEY"):
        return await call_openai(system_prompt, user_message)

    raise RuntimeError("No LLM provider configured for translation. Set OPENAI_API_KEY.")