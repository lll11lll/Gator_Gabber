// Speech-to-Text service using Web Speech API
// This allows users to speak and have their speech converted to text

let recognition = null;

// Initialize the speech recognition
export function initSpeechRecognition() {
  // Check if browser supports Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech Recognition not supported in this browser');
    return null;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES'; // Spanish language
  recognition.continuous = false; // Stop after one phrase
  recognition.interimResults = false; // Only return final results
  recognition.maxAlternatives = 1;

  return recognition;
}

// Start listening for speech
export function startListening(onResult, onError, onEnd) {
  if (!recognition) {
    recognition = initSpeechRecognition();
  }

  if (!recognition) {
    onError?.(new Error('Speech Recognition not supported'));
    return;
  }

  // Set up event handlers
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult?.(transcript);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    onError?.(event.error);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  try {
    recognition.start();
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    onError?.(error);
  }
}

// Stop listening
export function stopListening() {
  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
}

// Check if speech recognition is supported
export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
