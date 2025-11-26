import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, ScrollView, StatusBar, TouchableOpacity, Share } from 'react-native';
import {
    Provider as PaperProvider,
    Card,
    Text,
    TextInput,
    Button,
    IconButton,
    Menu,
    ActivityIndicator,
    Snackbar,
    MD3LightTheme as DefaultTheme,
    useTheme,
    Divider,
    List,
    Modal,
    Portal
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#6C63FF',
        secondary: '#03DAC6',
        background: '#F0F2F5',
        surface: '#FFFFFF',
        error: '#B00020',
        text: '#000000',
        onSurface: '#000000',
    },
    roundness: 12,
};

const API_KEY = 'AIzaSyAR8ikk5rUXFkrI5hUQzN2jwM5JgAIy9cM';

const languages = [
    { label: 'English', value: 'English', flag: '🇺🇸', code: 'en' },
    { label: 'Hindi', value: 'Hindi', flag: '🇮🇳', code: 'hi' },
    { label: 'French', value: 'French', flag: '🇫🇷', code: 'fr' },
    { label: 'German', value: 'German', flag: '🇩🇪', code: 'de' },
    { label: 'Spanish', value: 'Spanish', flag: '🇪🇸', code: 'es' },
    { label: 'Japanese', value: 'Japanese', flag: '🇯🇵', code: 'ja' },
    { label: 'Korean', value: 'Korean', flag: '🇰🇷', code: 'ko' },
    { label: 'Chinese', value: 'Chinese', flag: '🇨🇳', code: 'zh' },
    { label: 'Russian', value: 'Russian', flag: '🇷🇺', code: 'ru' },
    { label: 'Italian', value: 'Italian', flag: '🇮🇹', code: 'it' }
];

const TranslateApp = () => {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [fromLanguage, setFromLanguage] = useState(languages[0]);
    const [toLanguage, setToLanguage] = useState(languages[1]);
    const [fromMenuVisible, setFromMenuVisible] = useState(false);
    const [toMenuVisible, setToMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [historyVisible, setHistoryVisible] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const storedHistory = await AsyncStorage.getItem('translationHistory');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error('Failed to load history', error);
        }
    };

    const saveToHistory = async (original, translated, from, to) => {
        const newItem = {
            id: Date.now().toString(),
            original,
            translated,
            from,
            to,
            timestamp: new Date().toISOString()
        };
        const updatedHistory = [newItem, ...history].slice(0, 10); // Keep last 10
        setHistory(updatedHistory);
        await AsyncStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
    };

    const translateText = async () => {
        if (!inputText.trim()) {
            showSnackbar('Please enter text to translate');
            return;
        }

        setIsLoading(true);
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
                                    text: `Translate the following text from ${fromLanguage.value} to ${toLanguage.value}: "${inputText}"`
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

            const translated = response.data.candidates[0].content.parts[0].text;
            setTranslatedText(translated);
            saveToHistory(inputText, translated, fromLanguage.value, toLanguage.value);
            showSnackbar('Translation completed!');

        } catch (error) {
            console.error('Error during translation:', error.response?.data || error.message);
            showSnackbar('Translation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const swapLanguages = () => {
        const temp = fromLanguage;
        setFromLanguage(toLanguage);
        setToLanguage(temp);
    };

    const clearText = () => {
        setInputText('');
        setTranslatedText('');
    };

    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
        showSnackbar('Text copied to clipboard!');
    };

    const speakText = (text, languageCode) => {
        Speech.speak(text, { language: languageCode });
    };

    const shareText = async (text) => {
        try {
            await Share.share({
                message: text,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const showSnackbar = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <LinearGradient
                    colors={['#6C63FF', '#4834D4']}
                    style={styles.headerGradient}
                >
                    <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <Text variant="headlineMedium" style={styles.title}>BabelText</Text>
                            <IconButton
                                icon="history"
                                iconColor="#fff"
                                size={28}
                                onPress={() => setHistoryVisible(true)}
                            />
                        </View>
                        <Text variant="bodyMedium" style={styles.subtitle}>Real-Time Multilingual Translator</Text>
                    </SafeAreaView>
                </LinearGradient>

                <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.languageContainer}>
                                <View style={styles.languageBox}>
                                    <Text variant="labelMedium" style={styles.languageLabel}>From</Text>
                                    <Menu
                                        visible={fromMenuVisible}
                                        onDismiss={() => setFromMenuVisible(false)}
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() => setFromMenuVisible(true)}
                                                style={styles.languageButton}
                                                contentStyle={styles.languageButtonContent}
                                                labelStyle={styles.languageButtonLabel}
                                            >
                                                {fromLanguage.flag} {fromLanguage.value}
                                            </Button>
                                        }
                                    >
                                        {languages.map((lang) => (
                                            <Menu.Item
                                                key={lang.value}
                                                onPress={() => {
                                                    setFromLanguage(lang);
                                                    setFromMenuVisible(false);
                                                }}
                                                title={`${lang.flag} ${lang.label}`}
                                            />
                                        ))}
                                    </Menu>
                                </View>

                                <IconButton
                                    icon="swap-horizontal"
                                    mode="contained"
                                    containerColor="#F0F2F5"
                                    iconColor="#6C63FF"
                                    size={24}
                                    onPress={swapLanguages}
                                    style={styles.swapButton}
                                />

                                <View style={styles.languageBox}>
                                    <Text variant="labelMedium" style={styles.languageLabel}>To</Text>
                                    <Menu
                                        visible={toMenuVisible}
                                        onDismiss={() => setToMenuVisible(false)}
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() => setToMenuVisible(true)}
                                                style={styles.languageButton}
                                                contentStyle={styles.languageButtonContent}
                                                labelStyle={styles.languageButtonLabel}
                                            >
                                                {toLanguage.flag} {toLanguage.value}
                                            </Button>
                                        }
                                    >
                                        {languages.map((lang) => (
                                            <Menu.Item
                                                key={lang.value}
                                                onPress={() => {
                                                    setToLanguage(lang);
                                                    setToMenuVisible(false);
                                                }}
                                                title={`${lang.flag} ${lang.label}`}
                                            />
                                        ))}
                                    </Menu>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Content>
                            <TextInput
                                mode="outlined"
                                label="Enter text"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                numberOfLines={4}
                                style={styles.textInput}
                                right={<TextInput.Icon icon="close" onPress={clearText} />}
                            />
                            <View style={styles.actionRow}>
                                <Text style={styles.charCount}>{inputText.length}/500</Text>
                                <View style={styles.actionButtons}>
                                    <IconButton icon="content-copy" size={20} onPress={() => copyToClipboard(inputText)} />
                                    <IconButton icon="volume-high" size={20} onPress={() => speakText(inputText, fromLanguage.code)} />
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    <Button
                        mode="contained"
                        onPress={() => {
                            Keyboard.dismiss();
                            translateText();
                        }}
                        disabled={isLoading || !inputText.trim()}
                        style={styles.translateButton}
                        contentStyle={styles.translateButtonContent}
                        loading={isLoading}
                    >
                        {isLoading ? 'Translating...' : 'Translate'}
                    </Button>

                    {translatedText ? (
                        <Card style={styles.resultCard}>
                            <Card.Content>
                                <View style={styles.resultHeader}>
                                    <Text variant="titleMedium" style={styles.resultTitle}>Translation</Text>
                                    <View style={styles.actionButtons}>
                                        <IconButton icon="content-copy" size={20} onPress={() => copyToClipboard(translatedText)} />
                                        <IconButton icon="volume-high" size={20} onPress={() => speakText(translatedText, toLanguage.code)} />
                                        <IconButton icon="share-variant" size={20} onPress={() => shareText(translatedText)} />
                                    </View>
                                </View>
                                <Divider style={styles.divider} />
                                <Text variant="bodyLarge" style={styles.translatedText}>{translatedText}</Text>
                            </Card.Content>
                        </Card>
                    ) : null}
                </ScrollView>

                <Portal>
                    <Modal visible={historyVisible} onDismiss={() => setHistoryVisible(false)} contentContainerStyle={styles.modalContent}>
                        <Text variant="headlineSmall" style={styles.modalTitle}>History</Text>
                        <ScrollView>
                            {history.length === 0 ? (
                                <Text style={styles.emptyHistory}>No history yet.</Text>
                            ) : (
                                history.map((item) => (
                                    <List.Item
                                        key={item.id}
                                        title={item.original}
                                        description={item.translated}
                                        left={props => <List.Icon {...props} icon="history" />}
                                        onPress={() => {
                                            setInputText(item.original);
                                            setTranslatedText(item.translated);
                                            // Find language objects
                                            const from = languages.find(l => l.value === item.from) || languages[0];
                                            const to = languages.find(l => l.value === item.to) || languages[1];
                                            setFromLanguage(from);
                                            setToLanguage(to);
                                            setHistoryVisible(false);
                                        }}
                                    />
                                ))
                            )}
                        </ScrollView>
                        <Button onPress={() => setHistoryVisible(false)} style={styles.closeButton}>Close</Button>
                    </Modal>
                </Portal>

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    action={{
                        label: 'Dismiss',
                        onPress: () => setSnackbarVisible(false),
                    }}
                >
                    {snackbarMessage}
                </Snackbar>
            </PaperProvider>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F5',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    headerGradient: {
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 5,
    },
    card: {
        marginBottom: 16,
        borderRadius: 16,
        elevation: 4,
        backgroundColor: '#fff',
    },
    languageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    languageBox: {
        flex: 1,
    },
    languageLabel: {
        color: '#666',
        marginBottom: 4,
    },
    languageButton: {
        borderRadius: 8,
        borderColor: '#E0E0E0',
    },
    languageButtonContent: {
        height: 40,
    },
    languageButtonLabel: {
        fontSize: 13,
    },
    swapButton: {
        marginHorizontal: 8,
        marginTop: 18,
    },
    textInput: {
        backgroundColor: '#fff',
        fontSize: 16,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    charCount: {
        color: '#999',
        fontSize: 12,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    translateButton: {
        marginVertical: 8,
        borderRadius: 25,
        elevation: 4,
        backgroundColor: '#6C63FF',
    },
    translateButtonContent: {
        paddingVertical: 6,
    },
    resultCard: {
        marginTop: 16,
        borderRadius: 16,
        elevation: 4,
        backgroundColor: '#fff',
        borderLeftWidth: 5,
        borderLeftColor: '#03DAC6',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultTitle: {
        color: '#333',
        fontWeight: 'bold',
    },
    divider: {
        marginVertical: 8,
    },
    translatedText: {
        color: '#333',
        lineHeight: 24,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 16,
        maxHeight: '80%',
    },
    modalTitle: {
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyHistory: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
    closeButton: {
        marginTop: 16,
    },
});

export default TranslateApp;
