// OpenAI TTS Implementation
// Get API URL from environment variable or default to relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Keep track of current audio for stopping/canceling
let currentAudio = null;

/**
 * Speak Spanish text using OpenAI TTS API
 * @param {string} text - The Spanish text to speak
 * @param {Object} options - Options for speech
 * @param {number} options.rate - Speech rate (0.25 to 4.0, default 1.0)
 * @returns {Promise<void>}
 */
export async function speakSpanish(text, { rate = 1 } = {}) {
    try {
        // Stop any currently playing audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        // Clamp rate to OpenAI's supported range (0.25 to 4.0)
        const speed = Math.max(0.25, Math.min(4.0, rate));

        // Call backend TTS endpoint
        const response = await fetch(`${API_BASE_URL}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                speed: speed
            })
        });

        if (!response.ok) {
            throw new Error(`TTS API error: ${response.status}`);
        }

        // Get audio blob from response
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create and play audio
        currentAudio = new Audio(audioUrl);
        
        // Clean up blob URL when audio finishes
        currentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
        };

        // Handle errors
        currentAudio.onerror = (e) => {
            console.error('Audio playback error:', e);
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
        };

        // Play the audio
        await currentAudio.play();

    } catch (error) {
        console.error('TTS Error:', error);
        throw error;
    }
}

/**
 * Stop any currently playing speech
 */
export function stopSpeaking() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}

// Legacy compatibility - these functions are no longer needed with OpenAI TTS
// but kept for backwards compatibility
export function getSpanishVoices() {
    // OpenAI TTS uses 'alloy' voice - no voice selection needed
    return Promise.resolve([{ name: 'OpenAI Alloy', lang: 'es-ES' }]);
}