import os
import httpx

# ============================================================================
# OpenAI API Functions
# ============================================================================

async def call_openai(system_prompt: str, user_message: str) -> str:
    """
    Call OpenAI API for text-only conversations.
    
    Args:
        system_prompt: System instructions for the AI
        user_message: User's text message
        
    Returns:
        AI response as string
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OpenAI_API_KEY not set")
    model = os.getenv("openai_model", "gpt-5-mini")
    base_url = os.getenv("openai_base_url", "https://api.openai.com/v1")
    url = f"{base_url}/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, headers=headers, json=payload)
        
        if response.status_code >= 400:
            raise RuntimeError(f"OpenAI {response.status_code}: {response.text}")
        
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']


async def call_openai_vision(system_prompt: str, user_message: str, image_base64: str) -> str:
    """
    Call OpenAI API with vision support for image + text conversations.

    
    Args:
        system_prompt: System instructions for the AI
        user_message: User's text message (can be empty)
        image_base64: Base64-encoded image with data URL prefix
                     (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
        
    Returns:
        AI response as string
        
    Note:
        Vision models have higher token costs. Images are analyzed and 
        described by the AI in the context of the user's message.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OpenAI_API_KEY not set")
    
    # Use vision-capable model
    model = os.getenv("openai_vision_model", "gpt-5-mini")
    base_url = os.getenv("openai_base_url", "https://api.openai.com/v1")
    url = f"{base_url}/chat/completions"
    
    # Build multimodal content array
    user_content = []
    
    # Add text if provided
    if user_message and user_message.strip():
        user_content.append({
            "type": "text",
            "text": user_message
        })
    
    # Add image
    user_content.append({
        "type": "image_url",
        "image_url": {
            "url": image_base64,  # Base64 data URL
            "detail": "auto"  # Let API decide detail level
        }
    })
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "max_tokens": 1000  # Vision models require explicit token limit
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Vision API calls may take longer
    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(url, headers=headers, json=payload)
        
        if response.status_code >= 400:
            raise RuntimeError(f"OpenAI Vision {response.status_code}: {response.text}")
        
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']