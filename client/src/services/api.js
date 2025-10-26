// Get API URL from environment variable or default to relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ADDED - Feature 2: Update 'sendMessage' to accept a 'context' parameter
export async function sendMessage(message, context = 'default') {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // ADDED - Feature 2: Send the 'context' in the request body
    body: JSON.stringify({ message, context })
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.response || '';
}

// ADDED - Feature 1: New function to call the /api/translate endpoint
export async function translateText(text, target_language = 'English') {
  const res = await fetch(`${API_BASE_URL}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text, target_language: target_language })
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.translation || '';
}