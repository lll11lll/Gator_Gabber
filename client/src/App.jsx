import { useState, useEffect, useRef } from 'react'
import MessageBubble from './components/MessageBubble'
import { sendMessage } from './services/api'
import { speakSpanish } from './tts'
import { translateText } from './services/api'
import gatorGabberLogo from './assets/gatorGabber.png'
import './App.css'
// COMBINING ALL OUR COMPONENTS AND SERVICES 
// (MESSAGE BUBBLES, API CALLS, TTS) INTO THE MAIN APP

export default function App() {
  // state to hold messages
  const [messages, setMessages] = useState([
    {// ADDED - Feature 1: Message state now includes 'id' and 'translation' field
      id: 1, 
      role: 'assistant', 
      text: '¡Hola! ¿Cómo estás hoy?', 
      translation: null}
  ]);
  // state to hold user input
  const [input, setInput] = useState('');
  // state to hold loading status
  const [isLoading, setIsLoading] = useState(false);
  // ADDED - Feature 2: State to hold the current class context
  const [currentClass, setCurrentClass] = useState('default');

  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Auto-speak new AI messages
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.text !== '...') {
      speakSpanish(lastMsg.text);
    }
  }, [messages]);

  // ADDED - Feature 1: Handler for the "Repeat" button (normal speed)
  const handleRepeat = (text) => {
    speakSpanish(text, { rate: 1 });
  };

  // ADDED - Feature 1: Handler for the "Slow" button (slower speed)
  const handleSlow = (text) => {
    speakSpanish(text, { rate: 0.7 });
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

  async function handleSend(e){
    e?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
  
  // ADDED - Feature 1: Ensure new user message has 'id' and 'translation'
    const userMsg = { 
      id: Date.now(), 
      role: 'user', 
      text: trimmed, 
      translation: null 
    };
    const aiMsgID = Date.now() + 1; // Unique ID for the AI message
    // ADDED - Feature 1: Ensure placeholder AI message has 'id' and 'translation'
    const aiMsgPlaceholder = { 
      id: aiMsgID, 
      role: 'assistant', 
      text: '...', 
      translation: null 
    };
    
    setMessages([...messages, userMsg, aiMsgPlaceholder]);
    setInput('');
    setIsLoading(true);

  try {
    // ADDED - Feature 2: Pass the current class context to the API
      const reply = await sendMessage(trimmed, currentClass);

      // ADDED - Feature 1: Ensure final AI message has 'id' and 'translation'
      const aiMsg = { 
        id: aiMsgID, // Use same ID as placeholder
        role: 'assistant', 
        text: reply || 'No pude procesar eso.', 
        translation: null 
      };
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? aiMsg : m));
  }catch (err){
    console.error(err);
      const errorMsg = {
        id: aiMsgID, // Use same ID as placeholder
        role: 'assistant',
        text: 'Lo siento, tuve un error. Intenta de nuevo.',
        translation: null
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
      
      {/* This is the main app "card" */}
      <div className="app-container shadow-lg d-flex flex-column">
        
        {/* Header Navbar */}
        <header className="app-header navbar navbar-expand navbar-dark">
          <div className="container-fluid">
            <a className="navbar-brand d-flex align-items-center" href="#">
              {/* Updated logo per your screenshot */}
              <img src={gatorGabberLogo} alt="Voces Logo" width="40" height="40" className="d-inline-block align-text-top me-2" />
              Voces
            </a>
            
            {/* Context Selector Buttons */}
            <div className="context-selector btn-group" role="group" aria-label="Class Context">
              <span className="navbar-text me-2 d-none d-sm-inline">Clase:</span>
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
                Spanish 1130
              </button>
              <button 
                type="button"
                className={`btn btn-sm ${currentClass === 'spanish_2200' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setCurrentClass('spanish_2200')}
              >
                Intermediate
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
              />
              {m.translation && (
                <div className="translation-bubble">
                  {m.translation}
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
            {/* The button is on the far right */}
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






