import { useState, useRef } from 'react'
import MessageBubble from './components/MessageBubble'
import { sendMessage } from './services/api'
import { speakSpanish } from './tts'
import gatorGabberLogo from './assets/gatorGabber.png'

// COMBINING ALL OUR COMPONENTS AND SERVICES 
// (MESSAGE BUBBLES, API CALLS, TTS) INTO THE MAIN APP

export default function App() {
  // state to hold messages
  const [messages, setMessages] = useState([
    {role: 'assistant', message: '¡Hola! Soy tu asistente de chat en español. ¿En qué puedo ayudarte hoy?'}
  ]);
  // state to hold user input
  const [input, setInput] = useState('');
  // state to hold loading status
  const [loading, setLoading] = useState(false);
  // reference to input element
  const inputRef = useRef(null);

  
  async function handleSend(e){
    e?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
  
  // add user message to state
  const userMsg = {role: 'user', message: trimmed};
  // update messages state
  setMessages(prev=>[...prev, userMsg]);
  // clear input field
  setInput('');
  // set loading state
  setLoading(true);

  try {
    // send message to backend API
    const response = await sendMessage(trimmed);
    // add assistant message to state
    const assistantMsg = {role: 'assistant', message: response};
    setMessages(prev=>[...prev, assistantMsg]);
    // speak the assistant's response in Spanish
    speakSpanish(assistantMsg.message);
  }catch (err){
    // log error and add error message to state
    console.error('Error sending message:', err);
    const errorMsg = {role: 'assistant', message: 'Lo siento, error.'};
    setMessages(prev=>[...prev, errorMsg]);
    speakSpanish(errorMsg.message);
  }finally{
    // reset loading state
    setLoading(false);
    // focus input field
    inputRef.current?.focus?.();
  }
}
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <img src={gatorGabberLogo} alt="Gator Gabber Logo" style={{ width: 100, marginBottom: 16 }} />
      <h1 style={{ marginBottom: 8 }}>Gator Gabber</h1>
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: 'white' }}>
        {messages.map((m, i) => <MessageBubble key={i} role={m.role} message={m.message} />)}
        {loading && <div style={{ opacity: 0.6 }}>Gator Gabber está escribiendo…</div>}
      </div>  

    <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <input
      ref={inputRef}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Escribe tu mensaje…"
      style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
      />
      <button type="submit" disabled={loading} style={{ padding: '10px 14px', borderRadius: 8 }}>
        {loading ? 'Enviando…' : 'Enviar'}
      </button>
    </form>
  </div>

  );



}




