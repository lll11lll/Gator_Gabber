import { useState, useEffect, useRef } from 'react'
import { FaCog, FaPlus } from 'react-icons/fa' 
import MessageBubble from './components/MessageBubble'
import SettingsPanel from './components/SettingsPanel'
import { sendMessage } from './services/api'
import { speakSpanish } from './tts'
import { startListening, stopListening, isSpeechRecognitionSupported } from './stt'
import { translateText } from './services/api'
import { syllabifySpanishAdvanced } from './utils/syllabify'
import gatorGabberLogo from './assets/gatorGabber.png'
import './App.css'

export default function App() {
    // State to hold messages
    const [messages, setMessages] = useState([
        {
            id: 1, 
            role: 'assistant', 
            text: '¡Hola! ¿Cómo estás hoy?', 
            translation: null,
            syllables: null
        }
    ]);
    // State to hold user input
    const [input, setInput] = useState('');
    // State to hold loading status
    const [isLoading, setIsLoading] = useState(false);
    
    // State for the attached file metadata (File object)
    const [attachedFile, setAttachedFile] = useState(null); 
    
    // State for the file's Base64 content (for API transfer)
    const [fileContent, setFileContent] = useState(null); 
    
    // State to hold the current class context
    const [currentClass, setCurrentClass] = useState('default');
    // State to track if speech recognition is active
    const [isListening, setIsListening] = useState(false);
    // State to check if STT is supported
    const [sttSupported, setSttSupported] = useState(true);
    // Settings panel state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    // Voice settings state
    const [voiceSettings, setVoiceSettings] = useState({
        rate: 1.0,
        pitch: 1.0,
        voice: null
    });

    const inputRef = useRef(null);
    const chatWindowRef = useRef(null);
    // Ref for the hidden file input
    const fileInputRef = useRef(null); 
    const lastSpokenIdRef = useRef(null);

    // Check if STT is supported on component mount
    useEffect(() => {
        setSttSupported(isSpeechRecognitionSupported());
    }, []);

    // Auto-speak new AI messages
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
    }, [messages, voiceSettings]);

    // Handlers
    
    const handleRepeat = (text) => {
        speakSpanish(text, { ...voiceSettings, rate: 1 }).catch(err => {
            console.error('TTS error:', err);
        });
    };

    const handleSlow = (text) => {
        speakSpanish(text, { ...voiceSettings, rate: 0.7 }).catch(err => {
            console.error('TTS error:', err);
        });
    };

    const handleTranslate = async (textToTranslate, messageId) => {
        try {
            const message = messages.find(m => m.id === messageId);
            if (message && message.translation) return; 
            const translation = await translateText(textToTranslate);
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

    const handleSyllable = (textToSyllabify, messageId) => {
        try {
            const message = messages.find(m => m.id === messageId);
            if (message && message.syllables) return; 
            const syllabified = syllabifySpanishAdvanced(textToSyllabify);
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

    const handleMicrophoneClick = () => {
        if (isListening) {
            stopListening();
            setIsListening(false);
        } else {
            setIsListening(true);
            startListening(
                (transcript) => {
                    setInput(transcript);
                    setIsListening(false);
                },
                (error) => {
                    console.error('Speech recognition error:', error);
                    setIsListening(false);
                    alert('Error al reconocer el habla. Por favor, intenta de nuevo.');
                },
                () => {
                    setIsListening(false);
                }
            );
        }
    };

    // Handler for the Plus button (Triggers file selection)
    const handlePlusClick = () => {
        console.log('Plus button clicked. Triggering file input.');
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handler to process the selected file (Reads content as Base64)
    const handleFileChange = (event) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;

        if (selectedFile) {
            // Optional: Validation check file size (e.g., limit to 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) { 
                alert('El archivo es demasiado grande (máximo 10MB).');
                event.target.value = null;
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                // Save the content (Base64 string) and the file object
                setFileContent(e.target.result); 
                setAttachedFile(selectedFile); 
                console.log("File attached:", selectedFile.name);
                setInput(`[Archivo adjunto: ${selectedFile.name}]`);
            };

            reader.onerror = () => {
                 console.error("FileReader failed to read the file.");
                 alert('Error al leer el archivo. Intenta de nuevo.');
            };
            
            // Read the file as a Data URL (Base64 string)
            reader.readAsDataURL(selectedFile); 
        }
        
        // Clear the file input's value for re-selection
        event.target.value = null; 
    };
        
    // This is the completed function with file upload fix
    async function handleSend(e){
        e?.preventDefault?.();
        const trimmed = input.trim();
        if ((!trimmed && !attachedFile) || isLoading) return; 

        // 1. Prepare UI for sending
        const userMsgText = attachedFile 
            ? (trimmed || `[Archivo adjunto: ${attachedFile.name}]`) 
            : trimmed;

        const userMsg = { 
            id: Date.now(), 
            role: 'user', 
            text: userMsgText, 
            translation: null,
            syllables: null
        };
        const aiMsgID = Date.now() + 1;
        const aiMsgPlaceholder = { 
            id: aiMsgID, 
            role: 'assistant', 
            text: '...', 
            translation: null,
            syllables: null
        };

        setMessages(prev => [...prev, userMsg, aiMsgPlaceholder]);
        setInput('');
        
        // 2. Capture content and metadata before clearing state
        // Extract just the base64 content (remove the data URL prefix)
        let contentToSend = fileContent;
        if (contentToSend && contentToSend.includes(',')) {
            contentToSend = contentToSend.split(',')[1]; // Get only the base64 part
        }
        const fileMetadata = attachedFile 
            ? { name: attachedFile.name, type: attachedFile.type } 
            : null;
        
        // Debug logging
        
        console.log('Sending file:', fileMetadata);
        console.log('Base64 length:', contentToSend?.length);
        
        setAttachedFile(null); 
        setFileContent(null); // Clear content
        setIsLoading(true);

        // 3. Prepare the data for the API as JSON payload
        const payload = {
            text: trimmed, 
            classContext: currentClass, 
            file: contentToSend,      // Base64 content of the file (without data URL prefix)
            fileMetadata: fileMetadata // e.g., { name: "test.pdf", type: "application/pdf" }
        };

        try {
            // 4. Send the request using the JSON payload
            const reply = await sendMessage(payload); 
            
            // 5. Update UI with AI reply
            const aiMsg = { 
                id: aiMsgID,
                role: 'assistant', 
                text: reply || 'No pude procesar eso.', 
                translation: null,
                syllables: null
            };
            setMessages(prev => prev.map(m => m.id === aiMsg.id ? aiMsg : m));
        } catch (err) {
            console.error("API Error:", err);
            const errorMsg = {
                id: aiMsgID,
                role: 'assistant',
                text: 'Lo siento, tuve un error. Intenta de nuevo.',
                translation: null,
                syllables: null
            };
            setMessages(prev => prev.map(m => m.id === errorMsg.id ? errorMsg : m));
        } finally {
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
                        <div className="context-selector" role="group" aria-label="Class Context">
                            <span className="navbar-text d-none d-sm-inline">Clase:</span>
                            <button type="button" className={`btn btn-sm ${currentClass === 'default' ? 'btn-light' : 'btn-outline-light'}`} onClick={() => setCurrentClass('default')}>General</button>
                            <button type="button" className={`btn btn-sm ${currentClass === 'spanish_1130' ? 'btn-light' : 'btn-outline-light'}`} onClick={() => setCurrentClass('spanish_1130')}>SPN1130</button>
                            <button type="button" className={`btn btn-sm ${currentClass === 'spanish_1131' ? 'btn-light' : 'btn-outline-light'}`} onClick={() => setCurrentClass('spanish_1131')}>SPN1131</button>
                            <button type="button" className={`btn btn-sm ${currentClass === 'spanish_2200' ? 'btn-light' : 'btn-outline-light'}`} onClick={() => setCurrentClass('spanish_2200')}>SPN2200</button>
                            <button type="button" className={`btn btn-sm ${currentClass === 'spanish_2201' ? 'btn-light' : 'btn-outline-light'}`} onClick={() => setCurrentClass('spanish_2201')}>SPN2201</button>
                        </div>
                    </div>
                </header>

                {/* Chat Window */}
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
                            {m.translation && (<div className="translation-bubble">{m.translation}</div>)}
                            {m.syllables && (<div className="syllable-bubble">{m.syllables}</div>)}
                        </div>
                    ))}
                    {isLoading && (<div className="typing-indicator"><span></span><span></span><span></span></div>)}
                </div>

                {/* Footer and Form */}
                <footer className="message-form-container p-3 bg-white border-top">
                    <form className="message-form d-flex align-items-center" onSubmit={handleSend}>
                        
                        {/* Input field */}
                        <input
                            type="text"
                            className="form-control" 
                            value={input}
                            ref={inputRef}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={attachedFile ? `Archivo adjunto: ${attachedFile.name}` : "Escribe en español..."}
                            disabled={isLoading}
                        />
                        
                        {/* Plus button (triggers file selection) */}
                        <button 
                            type="button" 
                            onClick={handlePlusClick}
                            className="btn btn-plus-circle ms-2" 
                            title="Adjuntar Archivo" 
                            disabled={isLoading}
                        >
                            <FaPlus size={16} />
                        </button>

                        {/* Hidden native file input */}
                        <input
                            type="file"
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
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
                    
                        {/* Send button */}
                        <button type="submit" className="btn btn-send-circle ms-2" disabled={isLoading || (!input.trim() && !attachedFile)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.001.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                                {/* Next, I'll complete the file by adding the closing tags for the form, footer, and divs. */}
                            </svg>
                        </button>
                    </form>
                </footer>
            </div>

        </div>
    );
}