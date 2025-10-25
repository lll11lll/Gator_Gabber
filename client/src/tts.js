let cachedVoices = [];

function loadVoices() {
    cachedVoices = window.speechSynthesis.getVoices();
    return cachedVoices;
}

export function getSpanishVoices() {
    // Simple: return Spanish-capable voices for speech synthesis.
    // - Calls `loadVoices()` which uses `speechSynthesis.getVoices()`.
    // - If voices are not yet loaded (empty array), wait for the
    //   'voiceschanged' event and then pick Spanish voices.
    // - If voices are already available, return the filtered result right away.
    // Returns either:
    // - an array of voices (if available immediately), or
    // - a Promise that resolves to that array (if we had to wait for 'voiceschanged').
    // This keeps things simple for beginners: you can handle both sync and async
    // return values by using `const v = await getSpanishVoices()` or
    // `getSpanishVoices().then(...)`.
    let voices = loadVoices();
    if (!voices || voices.length === 0){
        return new Promise((resolve) => {
            const onChange = () => {
                voices = loadVoices();
                window.speechSynthesis.removeEventListener('voiceschanged', onChange);
                resolve(selectSpanish(voices))
        };
        window.speechSynthesis.addEventListener('voiceschanged', onChange);
        });
    }
    return selectSpanish(voices);
}

function selectSpanish(voices) {
    // prefer es-ES / es-MX / es-US
    if (!Array.isArray(voices) || voices.length === 0){
        return null;
    }
    // Step 1: try to find a voice with lang like "es-ES", "es-MX", "es-US", etc.
    // Explanation: ^(es-|es_) means the string starts (^) with "es-" or "es_".
    // Some platforms use underscore instead of hyphen.
    let preferred = null;
    for (const v of voices) {
        const lang = (v.lang || "").toLowerCase();
        const matchesSpanishD_Or_U = lang.startsWith("es-") || lang.startsWith("es_");
        if (matchesSpanishD_Or_U) {
            preferred = v;
            break;
        }
    }
    if (preferred){
        return preferred;
    }
     // Step 2: fallback — any language that starts with "es" (e.g., just "es")
     let genericSpanish = null;
     for (const v of voices){
        const lang = (v.lang || "").toLowerCase();
        if (lang.startsWith("es")){
            genericSpanish = v;
            break;
        }
     }

     if (genericSpanish){
        return genericSpanish;
     }

     // Step 3: absolute fallback — return the first available voice
     return voices[0] || null;
}

export async function speakSpanish(text, {rate=1, pitch=1, voice=null} = {} ){
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // stop anything

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = pitch;

    // Use provided voice or fallback to Spanish voice
    let selectedVoice;
    if (voice) {
        selectedVoice = voice;
    } else {
        selectedVoice = await getSpanishVoices();
    }
    
    if(selectedVoice) utter.voice = selectedVoice;
    utter.lang = selectedVoice?.lang || 'es-ES';
    window.speechSynthesis.speak(utter);
}