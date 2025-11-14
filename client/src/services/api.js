// Get API URL from environment variable or default to relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Send a message to the chat API with optional file attachment and custom prompts
 * 
 * @param {Object|string} payload - Either an object with {text, classContext, file, fileMetadata, customSystemPrompt, customInitialMessage} or a string message
 * @returns {Promise<string>} - AI response
 */
export async function sendMessage(payload) {
  // Support both new object format and legacy string format
  let requestBody;
  
  if (typeof payload === 'string') {
    // Legacy format: just a message string
    requestBody = { 
      text: payload, 
      classContext: 'default' 
    };
  } else {
    // New format: full payload object with file support and custom prompts
    requestBody = {
      text: payload.text || '',
      classContext: payload.classContext || 'default',
      file: payload.file || null,
      fileMetadata: payload.fileMetadata || null,
      customSystemPrompt: payload.customSystemPrompt || null,
      customInitialMessage: payload.customInitialMessage || null
    };
  }

  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
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