import axios from 'axios';

const API_KEY = 'AIzaSyAR8ikk5rUXFkrI5hUQzN2jwM5JgAIy9cM';

export const translateTextApi = async (text, fromLang, toLang) => {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                system_instruction: {
                    parts: [
                        {
                            text: "You are a helpful assistant that ONLY outputs the translation of the text. Do not include any extra words or explanation."
                        }
                    ]
                },
                contents: [
                    {
                        parts: [
                            {
                                text: `Translate the following text from ${fromLang} to ${toLang}: "${text}"`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.0,
                    candidate_count: 1,
                    top_p: 0.95,
                    top_k: 40,
                    max_output_tokens: 500,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error during translation:', error.response?.data || error.message);
        throw error;
    }
};
