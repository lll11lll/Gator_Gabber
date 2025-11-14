import { useState, useEffect } from 'react';
import { FaCog } from 'react-icons/fa'
import './SettingsPanel.css';

export default function SettingsPanel({ isOpen, onClose, settings, onSettingsChange, customPrompts, onCustomPromptsChange }) {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [spanishVoices, setSpanishVoices] = useState([]);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Filter Spanish voices
      const spanish = voices.filter(voice => 
        voice.lang.toLowerCase().startsWith('es')
      );
      setSpanishVoices(spanish);
    };

    loadVoices();
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleRateChange = (e) => {
    onSettingsChange({ ...settings, rate: parseFloat(e.target.value) });
  };

  const handlePitchChange = (e) => {
    onSettingsChange({ ...settings, pitch: parseFloat(e.target.value) });
  };

  const handleVoiceChange = (e) => {
    const selectedVoice = availableVoices.find(v => v.name === e.target.value);
    onSettingsChange({ ...settings, voice: selectedVoice });
  };

  const handleSystemPromptChange = (e) => {
    onCustomPromptsChange({ ...customPrompts, systemPrompt: e.target.value });
  };

  const handleInitialMessageChange = (e) => {
    onCustomPromptsChange({ ...customPrompts, initialMessage: e.target.value });
  };

  const handleResetPrompts = () => {
    onCustomPromptsChange({ systemPrompt: '', initialMessage: '' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="settings-backdrop" onClick={onClose} />
      
      {/* Settings Panel */}
      <div className="settings-panel">
        <div className="settings-header">
          <h3>
            <FaCog />
            Settings
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          {/* Teacher Customization Section */}
          <div className="settings-section">
            <h4 className="section-title">Teacher Customization</h4>
            
            <div className="setting-group">
              <label htmlFor="system-prompt">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                  <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                </svg>
                Custom System Prompt
              </label>
              <textarea
                id="system-prompt"
                className="settings-textarea"
                rows="4"
                placeholder="Enter custom instructions for the AI (e.g., 'Focus on vocabulary about food and restaurants'). Leave empty to use default class prompts."
                value={customPrompts.systemPrompt}
                onChange={handleSystemPromptChange}
              />
              <small className="setting-hint">
                Customize the AI's behavior and topic focus for your lesson
              </small>
            </div>

            <div className="setting-group">
              <label htmlFor="initial-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                </svg>
                Custom Initial Message
              </label>
              <textarea
                id="initial-message"
                className="settings-textarea"
                rows="2"
                placeholder="Enter a custom greeting in Spanish (e.g., '¡Hola estudiantes! Hoy vamos a practicar el pretérito.'). Leave empty for default."
                value={customPrompts.initialMessage}
                onChange={handleInitialMessageChange}
              />
              <small className="setting-hint">
                Set a custom greeting that students will see when starting the chat
              </small>
            </div>

            <div className="button-group">
              <button 
                className="reset-prompts-btn"
                onClick={handleResetPrompts}
                disabled={!customPrompts.systemPrompt && !customPrompts.initialMessage}
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Voice Settings Section */}
          <div className="settings-section">
            <h4 className="section-title">Voice Settings</h4>

          {/* Voice Selection */}
          <div className="setting-group">
            <label htmlFor="voice-select">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
              </svg>
              Voice
            </label>
            <select 
              id="voice-select"
              value={settings.voice?.name || ''} 
              onChange={handleVoiceChange}
              className="settings-select"
            >
              {spanishVoices.length > 0 ? (
                <>
                  <optgroup label="Spanish Voices">
                    {spanishVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </optgroup>
                  {availableVoices.filter(v => !v.lang.toLowerCase().startsWith('es')).length > 0 && (
                    <optgroup label="Other Voices">
                      {availableVoices
                        .filter(v => !v.lang.toLowerCase().startsWith('es'))
                        .map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                    </optgroup>
                  )}
                </>
              ) : (
                <option value="">Loading voices...</option>
              )}
            </select>
          </div>

          {/* Rate Control */}
          <div className="setting-group">
            <label htmlFor="rate-slider">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z"/>
                <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm1.038 3.018a6.093 6.093 0 0 1 .924 0 6 6 0 1 1-.924 0zM0 3.5c0 .753.333 1.429.86 1.887A8.035 8.035 0 0 1 4.387 1.86 2.5 2.5 0 0 0 0 3.5zM13.5 1c-.753 0-1.429.333-1.887.86a8.035 8.035 0 0 1 3.527 3.527A2.5 2.5 0 0 0 13.5 1z"/>
              </svg>
              Speed: <span className="setting-value">{settings.rate.toFixed(1)}x</span>
            </label>
            <input
              id="rate-slider"
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={settings.rate}
              onChange={handleRateChange}
              className="settings-slider"
            />
            <div className="slider-labels">
              <span>0.1x (Slow)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div className="setting-group">
            <label htmlFor="pitch-slider">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5z"/>
              </svg>
              Pitch: <span className="setting-value">{settings.pitch.toFixed(1)}</span>
            </label>
            <input
              id="pitch-slider"
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={settings.pitch}
              onChange={handlePitchChange}
              className="settings-slider"
            />
            <div className="slider-labels">
              <span>0.1 (Low)</span>
              <span>2.0 (High)</span>
            </div>
          </div>

          {/* Test Button */}
          <button 
            className="test-voice-btn"
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance('¡Hola! Esta es una prueba de voz.');
              utterance.rate = settings.rate;
              utterance.pitch = settings.pitch;
              if (settings.voice) {
                utterance.voice = settings.voice;
              }
              utterance.lang = settings.voice?.lang || 'es-ES';
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utterance);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
            Test Voice
          </button>
          </div>
        </div>
      </div>
    </>
  );
}
