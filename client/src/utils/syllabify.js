// Spanish syllabification utility
// Breaks Spanish words into syllables following Spanish phonetic rules

export function syllabifySpanish(text) {
  // Split text into words
  const words = text.split(/\s+/);
  
  // Process each word and return syllabified version
  const syllabifiedWords = words.map(word => {
    // Keep punctuation separate
    const punctuation = word.match(/[.,!?;:¡¿"'()]+$/)?.[0] || '';
    const cleanWord = word.replace(/[.,!?;:¡¿"'()]+$/g, '');
    
    if (cleanWord.length === 0) return word;
    
    const syllables = breakIntoSyllables(cleanWord.toLowerCase());
    return syllables.join('-') + punctuation;
  });
  
  return syllabifiedWords.join(' ');
}

function breakIntoSyllables(word) {
  // Simple Spanish syllabification rules
  // This is a simplified version - full Spanish syllabification is complex
  
  const vowels = 'aeiouáéíóúüAEIOUÁÉÍÓÚÜ';
  const consonants = 'bcdfghjklmnpqrstvwxyzñBCDFGHJKLMNPQRSTVWXYZÑ';
  
  const syllables = [];
  let currentSyllable = '';
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const nextChar = word[i + 1];
    const prevChar = word[i - 1];
    
    currentSyllable += char;
    
    // If current is vowel and next is consonant followed by vowel
    if (vowels.includes(char) && nextChar && consonants.includes(nextChar)) {
      const nextNextChar = word[i + 2];
      
      // Check for consonant clusters that stay together
      if (nextNextChar && vowels.includes(nextNextChar)) {
        const cluster = nextChar + nextNextChar;
        const inseparableClusters = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'ch', 'll', 'rr'];
        
        if (inseparableClusters.includes((nextChar + word[i + 2]).toLowerCase())) {
          // Keep cluster with next syllable
          syllables.push(currentSyllable);
          currentSyllable = '';
        } else {
          // Split here
          syllables.push(currentSyllable);
          currentSyllable = '';
        }
      }
    }
    // If we have two vowels in a row (diphthong check)
    else if (vowels.includes(char) && nextChar && vowels.includes(nextChar)) {
      const strongVowels = 'aeoáéóAEOÁÉÓ';
      const weakVowels = 'iuíúIUÍÚ';
      
      // Strong + weak or weak + weak stay together (diphthong)
      if ((strongVowels.includes(char) && weakVowels.includes(nextChar)) ||
          (weakVowels.includes(char) && weakVowels.includes(nextChar))) {
        // Keep together
        currentSyllable += nextChar;
        i++; // Skip next vowel
        
        // Check if we should break after this
        if (word[i + 1] && consonants.includes(word[i + 1])) {
          syllables.push(currentSyllable);
          currentSyllable = '';
        }
      } else {
        // Two strong vowels = break
        syllables.push(currentSyllable);
        currentSyllable = '';
      }
    }
  }
  
  // Add remaining syllable
  if (currentSyllable) {
    syllables.push(currentSyllable);
  }
  
  // If we didn't break it up well, just return the whole word
  if (syllables.length === 0) {
    return [word];
  }
  
  return syllables;
}

// Alternative: More accurate syllabification using common Spanish patterns
export function syllabifySpanishAdvanced(text) {
  const words = text.split(/\s+/);
  
  const syllabifiedWords = words.map(word => {
    // Keep punctuation separate
    const punctuation = word.match(/[.,!?;:¡¿"'()]+$/)?.[0] || '';
    const cleanWord = word.replace(/[.,!?;:¡¿"'()]+$/g, '');
    
    if (cleanWord.length === 0) return word;
    
    // Use more advanced rules
    const syllables = advancedBreak(cleanWord.toLowerCase());
    return syllables.join('·') + punctuation; // Using middle dot for syllable separator
  });
  
  return syllabifiedWords.join(' ');
}

function advancedBreak(word) {
  // More sophisticated Spanish syllabification
  // V = vowel, C = consonant
  
  const result = [];
  let current = '';
  const chars = word.split('');
  
  const isVowel = (c) => 'aeiouáéíóúüAEIOUÁÉÍÓÚÜ'.includes(c);
  const isConsonant = (c) => 'bcdfghjklmnpqrstvwxyzñBCDFGHJKLMNPQRSTVWXYZÑ'.includes(c);
  
  for (let i = 0; i < chars.length; i++) {
    current += chars[i];
    
    // Look ahead
    const c1 = chars[i];
    const c2 = chars[i + 1];
    const c3 = chars[i + 2];
    
    // Rule: V + C + V → V·CV
    if (isVowel(c1) && c2 && isConsonant(c2) && c3 && isVowel(c3)) {
      result.push(current);
      current = '';
    }
    // Rule: V + C + C + V → VC·CV (unless CC is an inseparable cluster)
    else if (isVowel(c1) && c2 && isConsonant(c2) && c3 && isConsonant(c3)) {
      const cluster = (c2 + c3).toLowerCase();
      const inseparable = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'ch', 'll', 'rr'];
      
      if (inseparable.includes(cluster)) {
        result.push(current);
        current = '';
      } else {
        current += c2;
        result.push(current);
        current = '';
        i++; // Skip the consonant we just added
      }
    }
  }
  
  if (current) {
    result.push(current);
  }
  
  return result.length > 0 ? result : [word];
}
