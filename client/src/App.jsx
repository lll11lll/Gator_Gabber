import { useState, useEffect, useRef } from 'react'
import { FaCog } from 'react-icons/fa'
import MessageBubble from './components/MessageBubble'
import SettingsPanel from './components/SettingsPanel'
import { sendMessage } from './services/api'
import { speakSpanish } from './tts'
import { startListening, stopListening, isSpeechRecognitionSupported } from './stt'
import { translateText } from './services/api'
import { syllabifySpanishAdvanced } from './utils/syllabify'
import gatorGabberLogo from './assets/gatorGabber.png'
import './App.css'
// COMBINING ALL OUR COMPONENTS AND SERVICES 
// (MESSAGE BUBBLES, API CALLS, TTS, STT) INTO THE MAIN APP

export default function App() {
  // state to hold messages
  const [messages, setMessages] = useState([
    {// ADDED - Feature 1: Message state now includes 'id', 'translation', and 'syllables' field
      id: 1, 
      role: 'assistant', 
      text: '¡Hola! ¿Cómo estás hoy?', 
      translation: null,
      syllables: null}
  ]);
  // state to hold user input
  const [input, setInput] = useState('');
  // state to hold loading status
  const [isLoading, setIsLoading] = useState(false);
  // ADDED - Feature 2: State to hold the current class context
  const [currentClass, setCurrentClass] = useState('default');
  // ADDED - Feature 3: State to track if speech recognition is active
  const [isListening, setIsListening] = useState(false);
  // ADDED - Feature 3: State to check if STT is supported
  const [sttSupported, setSttSupported] = useState(true);
  // ADDED - Feature 4: Settings panel state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // ADDED - Feature 4: Voice settings state
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    voice: null
  });

  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);
  const lastSpokenIdRef = useRef(null);

  // Check if STT is supported on component mount
  useEffect(() => {
    setSttSupported(isSpeechRecognitionSupported());
  }, []);

  // Auto-speak new AI messages (only when truly new, not when translation/syllables added)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && 
        lastMsg.role === 'assistant' && 
        lastMsg.text !== '...' && 
        lastMsg.id !== lastSpokenIdRef.current) {
      lastSpokenIdRef.current = lastMsg.id;
      speakSpanish(lastMsg.text, voiceSettings).catch(err => {
        console.error('TTS error:', err);
      });
    }
  }, [messages]);

  // ADDED - Feature 1: Handler for the "Repeat" button (normal speed)
  const handleRepeat = (text) => {
    speakSpanish(text, { ...voiceSettings, rate: 1 }).catch(err => {
      console.error('TTS error:', err);
    });
  };

  // ADDED - Feature 1: Handler for the "Slow" button (slower speed)
  const handleSlow = (text) => {
    speakSpanish(text, { ...voiceSettings, rate: 0.7 }).catch(err => {
      console.error('TTS error:', err);
    });
  };

  // ADDED - Feature 1: Handler for the "Translate" button
  const handleTranslate = async (textToTranslate, messageId) => {
    try {
      // Check if already translated
      const message = messages.find(m => m.id === messageId);
      if (message && message.translation) return; // Don't re-translate

      const translation = await translateText(textToTranslate);

      // Find the message by ID and update its translation field
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.id === messageId ? { ...m, translation: translation } : m
        )
      );
    } catch (err) {
      console.error("Translation failed:", err);
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.id === messageId ? { ...m, translation: "[Translation failed]" } : m
        )
      );
    }
  };

  // ADDED - Feature: Handler for the "Syllable" button
  const handleSyllable = (textToSyllabify, messageId) => {
    try {
      // Check if already syllabified
      const message = messages.find(m => m.id === messageId);
      if (message && message.syllables) return; // Don't re-syllabify

      // Use the advanced syllabification function
      const syllabified = syllabifySpanishAdvanced(textToSyllabify);

      // Find the message by ID and update its syllables field
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.id === messageId ? { ...m, syllables: syllabified } : m
        )
      );
    } catch (err) {
      console.error("Syllabification failed:", err);
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.id === messageId ? { ...m, syllables: "[Syllabification failed]" } : m
        )
      );
    }
  };

  // ADDED - Feature 3: Handler for microphone button
  const handleMicrophoneClick = () => {
    if (isListening) {
      // Stop listening
      stopListening();
      setIsListening(false);
    } else {
      // Start listening
      setIsListening(true);
      startListening(
        // onResult callback
        (transcript) => {
          setInput(transcript);
          setIsListening(false);
        },
        // onError callback
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          alert('Error al reconocer el habla. Por favor, intenta de nuevo.');
        },
        // onEnd callback
        () => {
          setIsListening(false);
        }
      );
    }
  };

  async function handleSend(e){
    e?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
  
  // ADDED - Feature 1: Ensure new user message has 'id', 'translation', and 'syllables'
    const userMsg = { 
      id: Date.now(), 
      role: 'user', 
      text: trimmed, 
      translation: null,
      syllables: null
    };
    const aiMsgID = Date.now() + 1; // Unique ID for the AI message
    // ADDED - Feature 1: Ensure placeholder AI message has 'id', 'translation', and 'syllables'
    const aiMsgPlaceholder = { 
      id: aiMsgID, 
      role: 'assistant', 
      text: '...', 
      translation: null,
      syllables: null
    };
    
    setMessages([...messages, userMsg, aiMsgPlaceholder]);
    setInput('');
    setIsLoading(true);

  try {
    // ADDED - Feature 2: Pass the current class context to the API
      const reply = await sendMessage(trimmed, currentClass);

      // ADDED - Feature 1: Ensure final AI message has 'id', 'translation', and 'syllables'
      const aiMsg = { 
        id: aiMsgID, // Use same ID as placeholder
        role: 'assistant', 
        text: reply || 'No pude procesar eso.', 
        translation: null,
        syllables: null
      };
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? aiMsg : m));
  }catch (err){
    console.error(err);
      const errorMsg = {
        id: aiMsgID, // Use same ID as placeholder
        role: 'assistant',
        text: 'Lo siento, tuve un error. Intenta de nuevo.',
        translation: null,
        syllables: null
      };
      setMessages(prev => prev.map(m => m.id === errorMsg.id ? errorMsg : m));
  }finally{
    // reset loading state
    setIsLoading(false);
    inputRef.current?.focus?.();
  }
}
  return (
    <div className="page-wrapper">
      
      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onSettingsChange={setVoiceSettings}
      />
      
      {/* This is the main app "card" */}
      <div className="app-container shadow-lg d-flex flex-column">
        
        {/* Header Navbar */}
        <header className="app-header navbar navbar-expand navbar-dark">
          <div className="header-wrapper">
            {/* Top row: Logo left, Settings right */}
            <div className="header-top-row">
              <a className="navbar-brand" href="#">
                <img src={gatorGabberLogo} alt="GatorGabber Logo" width="40" height="40" />
                GatorGabber
              </a>
              
              <button 
                className="settings-icon-btn"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="Settings"
                aria-label="Open settings"
              >
                <FaCog size={20} />
              </button>
            </div>
            
            {/* Bottom row: Context Selector */}
            <div className="context-selector" role="group" aria-label="Class Context">
              <span className="navbar-text d-none d-sm-inline">Clase:</span>
              <button 
                type="button"
                className={`btn btn-sm ${currentClass === 'default' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setCurrentClass('default')}
              >
                General
              </button>
              <button 
                type="button"
                className={`btn btn-sm ${currentClass === 'spanish_1130' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setCurrentClass('spanish_1130')}
              >
                SPN1130
              </button>
                            <button 
                type="button"
                className={`btn btn-sm ${currentClass === 'spanish_1131' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setCurrentClass('spanish_1131')}
              >
                SPN1131
              </button>
              <button 
                type="button"
                className={`btn btn-sm ${currentClass === 'spanish_2200' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setCurrentClass('spanish_2200')}
              >
                SPN2200
              </button>
                            <button 
                type="button"
                className={`btn btn-sm ${currentClass === 'spanish_2201' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setCurrentClass('spanish_2201')}
              >
                SPN2201
              </button>
            </div>
          </div>
        </header>

        {/* Chat Window: flex-grow-1 makes it fill the space */}
        <div className="chat-window flex-grow-1 p-3 p-md-4" ref={chatWindowRef}>
          {messages.map((m) => (
            <div key={m.id}>
              <MessageBubble
                id={m.id}
                role={m.role}
                text={m.text}
                onRepeat={handleRepeat}
                onSlow={handleSlow}
                onTranslate={handleTranslate}
                onSyllable={handleSyllable}
              />
              {m.translation && (
                <div className="translation-bubble">
                  {m.translation}
                </div>
              )}
              {m.syllables && (
                <div className="syllable-bubble">
                  {m.syllables}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>

        {/* This footer is pushed to the bottom by the chat window above */}
        <footer className="message-form-container p-3 bg-white border-top">
          {/* This form is a flex container */}
          <form className="message-form d-flex align-items-center" onSubmit={handleSend}>
            {/* The input grows to fill the space */}
            <input
              type="text"
              className="form-control" // CSS makes this borderless
              value={input}
              ref={inputRef}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe en español..."
              disabled={isLoading}
            />
            {/* Microphone button */}
            {sttSupported && (
              <button 
                type="button" 
                className={`btn btn-mic-circle ms-2 ${isListening ? 'listening' : ''}`}
                onClick={handleMicrophoneClick}
                disabled={isLoading}
                title="Hablar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-mic-fill" viewBox="0 0 16 16">
                  <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
                  <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                </svg>
              </button>
            )}
            {/* The send button is on the far right */}
            <button type="submit" className="btn btn-send-circle ms-2" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.001.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
              </svg>
            </button>
          </form>
        </footer>
      </div>

    </div>
  );
}






