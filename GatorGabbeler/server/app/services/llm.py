# POTENTIAL RAG IMPLEMENTATION
# context = retrieve_relevant_documents(user_message)
# augmented_message = f"{context}\n\nUser Question: {user_message}"
import os
from .providers.openai_provider import call_openai
from ..config.system_prompt import GABBER_SYSTEM_PROMPT



# Generate spanish response function
async def generate_spanish_reply(user_message: str) -> str:
    augmented_message = user_message  # Placeholder for potential RAG augmentation

    response = await call_openai(GABBER_SYSTEM_PROMPT, augmented_message)
    return response

