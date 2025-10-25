import { useState, useEffect } from 'react';
import { FaCog } from 'react-icons/fa'
import './SettingsPanel.css';

export default function SettingsPanel({ isOpen, onClose, settings, onSettingsChange }) {
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
            Voice Settings
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>

        <div className="settings-content">
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
    </>
  );
}
