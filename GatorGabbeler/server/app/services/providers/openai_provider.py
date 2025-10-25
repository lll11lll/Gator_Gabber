import os
import httpx
# FUNCTION TO CALL OPENAI API
# Hola, ¿puedes presentarte?"

async def call_openai(system_prompt:str, user_message:str) -> str:
    api_key = os.getenv("openai_api_key")
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

    # Use an asynchronous HTTP client to call the OpenAI Chat Completions endpoint.
    # Steps:
    # 1. Create an AsyncClient with a 60-second timeout to avoid blocking forever.
    # 2. Send a POST request to `url` with the authorization header and the JSON `payload`.
    # 3. Call `response.raise_for_status()` to raise an exception for any non-2xx HTTP
    #    status codes so error handling can be performed by the caller.
    # 4. Parse the response body as JSON with `response.json()` and extract the
    #    assistant's reply from the OpenAI chat response structure at
    #    `choices[0]['message']['content']`.
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            url,
            headers=headers,
            json=payload
        )
        if response.status_code >= 400:
            raise RuntimeError(f"OpenAI {response.status_code}: {response.text}")
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']