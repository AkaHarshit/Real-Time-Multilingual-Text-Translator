import axios from 'axios';

// Language code mapping for translation APIs
const languageCodeMap = {
    'English': 'en',
    'Hindi': 'hi',
    'French': 'fr',
    'German': 'de',
    'Spanish': 'es',
    'Japanese': 'ja',
    'Korean': 'ko',
    'Chinese': 'zh',
    'Russian': 'ru',
    'Italian': 'it'
};

// Gemini API Key
const GEMINI_API_KEY = 'AIzaSyAR8ikk5rUXFkrI5hUQzN2jwM5JgAIy9cM';

// MyMemory Translation API (Free, no API key required)
const translateWithMyMemory = async (text, fromLang, toLang) => {
    const fromCode = languageCodeMap[fromLang] || 'en';
    const toCode = languageCodeMap[toLang] || 'en';
    
    const response = await axios.get(
        `https://api.mymemory.translated.net/get`,
        {
            params: {
                q: text,
                langpair: `${fromCode}|${toCode}`
            },
            timeout: 15000
        }
    );
    
    if (response.data && response.data.responseData && response.data.responseData.translatedText) {
        return response.data.responseData.translatedText;
    }
    throw new Error('Translation failed from MyMemory API');
};

// Gemini API as fallback
const translateWithGemini = async (text, fromLang, toLang) => {
    const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
    ];
    
    for (const url of endpoints) {
        try {
            const response = await axios.post(
                url,
                {
                    contents: [{
                        parts: [{
                            text: `Translate the following text from ${fromLang} to ${toLang}. Only output the translation, nothing else:\n\n${text}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 500,
                    }
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );

            if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                return response.data.candidates[0].content.parts[0].text.trim();
            }
        } catch (error) {
            // Try next endpoint
            continue;
        }
    }
    throw new Error('All Gemini endpoints failed');
};

export const translateTextApi = async (text, fromLang, toLang) => {
    // If same language, return text as-is
    if (fromLang === toLang) {
        return text;
    }
    
    try {
        // Try MyMemory API first (free, reliable, no API key needed)
        try {
            const result = await translateWithMyMemory(text, fromLang, toLang);
            return result;
        } catch (myMemoryError) {
            console.log('MyMemory API failed, trying Gemini...', myMemoryError.message);
            
            // Fallback to Gemini API
            try {
                const result = await translateWithGemini(text, fromLang, toLang);
                return result;
            } catch (geminiError) {
                console.log('Gemini API also failed:', geminiError.message);
                // If both fail, throw the MyMemory error (more user-friendly)
                throw myMemoryError;
            }
        }
    } catch (error) {
        console.error('Translation error:', error);
        
        // Provide user-friendly error messages
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (error.response?.status === 400) {
            throw new Error('Invalid request. Please check your input and try again.');
        } else if (error.message) {
            throw new Error(`Translation failed: ${error.message}. Please check your internet connection and try again.`);
        } else {
            throw new Error('Translation failed. Please check your internet connection and try again.');
        }
    }
};
