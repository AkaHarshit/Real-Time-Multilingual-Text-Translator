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

    const API_KEY = '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';

    // Memoized handlers to prevent unnecessary re-renders
    const handleSetOpenFrom = useCallback((open) => setOpenFrom(open), []);
    const handleSetOpenTo = useCallback((open) => setOpenTo(open), []);
    const handleSetFromLanguage = useCallback((value) => setFromLanguage(value), []);
    const handleSetToLanguage = useCallback((value) => setToLanguage(value), []);

    const translateText = async () => {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that translates text.' },
                        { role: 'user', content: `Translate the following text from ${fromLanguage} to ${toLanguage}: ${inputText}` }
                    ],
                    max_tokens: 1000,
                    temperature: 0.3,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${API_KEY}`,
                    },
                }
            );

            const translated = response.data.choices[0].message.content; // Extract translated text
            setTranslatedText(translated); // Update state
        } catch (error) {
            console.error('Error during translation:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>TranslateApp</Text>
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
                    onChangeValue={(value) => setFromLanguage(value)}
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
                    onChangeValue={(value) => setToLanguage(value)}
                />
            </View>
            <TextInput
                style={styles.input}
                onChangeText={(text) => setInputText(text)}
                value={inputText}
                multiline
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
            <Text style={styles.title2}>Translated Text: </Text>
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
        marginBottom: 20,
        marginTop: 50,
    },
    text: {
        color: '#fff',
        fontSize: 20,
    },
});