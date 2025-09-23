import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';

const TranslateApp = () => {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [fromLanguage, setFromLanguage] = useState('English');
    const [toLanguage, setToLanguage] = useState('Hindi');
    const [openFrom, setOpenFrom] = useState(false);
    const [openTo, setOpenTo] = useState(false);

    const API_KEY = 'AIzaSyClglfVB8HPSi_wA6L0R7SITY3RqiX_xhk';

    const handleSetOpenFrom = useCallback((open) => setOpenFrom(open), []);
    const handleSetOpenTo = useCallback((open) => setOpenTo(open), []);
    const handleSetFromLanguage = useCallback((value) => setFromLanguage(value), []);
    const handleSetToLanguage = useCallback((value) => setToLanguage(value), []);

    const translateText = async () => {
        if (!inputText.trim()) return; 
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
                                    text: `Translate the following text from ${fromLanguage} to ${toLanguage}: "${inputText}"`
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
                        thinkingConfig: { thinkingBudget: 0 }
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const translated = response.data.candidates[0].content.parts[0].text;
            setTranslatedText(translated);

        } catch (error) {
            console.error('Error during translation:', error.response?.data || error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>BabelText</Text>
            <View style={styles.dropdowncontainer}>
                <DropDownPicker
                    open={openFrom}
                    value={fromLanguage}
                    setOpen={handleSetOpenFrom}
                    setValue={handleSetFromLanguage}
                    items={[
                        { label: 'English', value: 'English' },
                        { label: 'Hindi', value: 'Hindi' },
                        { label: 'French', value: 'French' },
                        { label: 'German', value: 'German' },
                        { label: 'Spanish', value: 'Spanish'}
                    ]}
                    style={styles.dropdown}
                    containerStyle={{ flex: 1, alignItems: 'center' }}
                />
                <DropDownPicker
                    open={openTo}
                    value={toLanguage}
                    setOpen={handleSetOpenTo}
                    setValue={handleSetToLanguage}
                    items={[
                        { label: 'English', value: 'English' },
                        { label: 'Hindi', value: 'Hindi' },
                        { label: 'French', value: 'French' },
                        { label: 'German', value: 'German' },
                        { label: 'Spanish', value: 'Spanish'}
                    ]}
                    style={styles.dropdown}
                    containerStyle={{ flex: 1, alignItems: 'center' }}
                />
            </View>
            <TextInput
                style={styles.input}
                onChangeText={(text) => setInputText(text)}
                value={inputText}
                multiline
                placeholder="Enter text to translate"
                placeholderTextColor="#888"
            />
            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    Keyboard.dismiss();
                    translateText();
                }}
            >
                <Text style={styles.buttonText}>Translate</Text>
            </TouchableOpacity>
            <Text style={styles.title2}>Translated Text:</Text>
            <Text style={styles.text}>{translatedText}</Text>
        </View>
    );
};

export default TranslateApp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 100,
    },
    dropdowncontainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    dropdown: {
        backgroundColor: '#fff',
        width: 200,
        marginTop: 50,
    },
    input: {
        height: 150,
        width: '100%',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#fff',
        color: '#fff',
        padding: 10,
        marginTop: 100,
    },
    button: {
        backgroundColor: '#026efd',
        width: 200,
        height: 50,
        marginTop: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    title2: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 50,
        marginBottom: 20,
    },
    text: {
        color: '#fff',
        fontSize: 20,
    },
});
