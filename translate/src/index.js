import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Keyboard, ScrollView, StatusBar } from 'react-native';
import { 
    Provider as PaperProvider, 
    Card, 
    Title, 
    Paragraph, 
    TextInput, 
    Button, 
    Surface,
    Divider,
    ActivityIndicator,
    Snackbar,
    IconButton,
    Menu,
    Chip
} from 'react-native-paper';
import axios from 'axios';

const TranslateApp = () => {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [fromLanguage, setFromLanguage] = useState('English');
    const [toLanguage, setToLanguage] = useState('Hindi');
    const [fromMenuVisible, setFromMenuVisible] = useState(false);
    const [toMenuVisible, setToMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const API_KEY = 'AIzaSyClglfVB8HPSi_wA6L0R7SITY3RqiX_xhk';

    const languages = [
        { label: 'English', value: 'English', flag: '🇺🇸' },
        { label: 'Hindi', value: 'Hindi', flag: '🇮🇳' },
        { label: 'French', value: 'French', flag: '🇫🇷' },
        { label: 'German', value: 'German', flag: '🇩🇪' },
        { label: 'Spanish', value: 'Spanish', flag: '🇪🇸' },
        { label: 'Japanese', value: 'Japanese', flag: '🇯🇵' },
        { label: 'Korean', value: 'Korean', flag: '🇰🇷' },
        { label: 'Chinese', value: 'Chinese', flag: '🇨🇳' },
        { label: 'Russian', value: 'Russian', flag: '🇷🇺' },
        { label: 'Italian', value: 'Italian', flag: '🇮🇹' }
    ];

    const translateText = async () => {
        if (!inputText.trim()) {
            setSnackbarMessage('Please enter text to translate');
            setSnackbarVisible(true);
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
            setSnackbarMessage('Translation completed successfully!');
            setSnackbarVisible(true);

        } catch (error) {
            console.error('Error during translation:', error.response?.data || error.message);
            setSnackbarMessage('Translation failed. Please try again.');
            setSnackbarVisible(true);
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

    return (
        <PaperProvider>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerGradient}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <IconButton
                                icon="translate"
                                iconColor="#fff"
                                size={28}
                                style={styles.headerIcon}
                            />
                            <Title style={styles.title}>BabelText</Title>
                            <IconButton
                                icon="earth"
                                iconColor="#fff"
                                size={28}
                                style={styles.headerIcon}
                            />
                        </View>
                        <Paragraph style={styles.subtitle}>Real-Time Multilingual Translator</Paragraph>
                        <View style={styles.headerStats}>
                            <View style={styles.statItem}>
                                <Paragraph style={styles.statNumber}>10+</Paragraph>
                                <Paragraph style={styles.statLabel}>Languages</Paragraph>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Paragraph style={styles.statNumber}>∞</Paragraph>
                                <Paragraph style={styles.statLabel}>Translations</Paragraph>
                            </View>
                        </View>
                    </View>
                </View>
                <Card style={styles.card} elevation={2}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Select Languages</Title>
                        <View style={styles.languageContainer}>
                            <View style={styles.languageBox}>
                                <Paragraph style={styles.languageLabel}>From</Paragraph>
                                <Menu
                                    visible={fromMenuVisible}
                                    onDismiss={() => setFromMenuVisible(false)}
                                    anchor={
                                        <Button
                                            mode="outlined"
                                            onPress={() => setFromMenuVisible(true)}
                                            style={styles.languageButton}
                                            contentStyle={styles.languageButtonContent}
                                        >
                                            {languages.find(lang => lang.value === fromLanguage)?.flag} {fromLanguage}
                                        </Button>
                                    }
                                >
                                    {languages.map((language) => (
                                        <Menu.Item
                                            key={language.value}
                                            onPress={() => {
                                                setFromLanguage(language.value);
                                                setFromMenuVisible(false);
                                            }}
                                            title={`${language.flag} ${language.label}`}
                                        />
                                    ))}
                                </Menu>
                            </View>

                            <Button
                                mode="outlined"
                                onPress={swapLanguages}
                                style={styles.swapButton}
                                icon="swap-horizontal"
                                compact
                            >
                                Swap
                            </Button>

                            <View style={styles.languageBox}>
                                <Paragraph style={styles.languageLabel}>To</Paragraph>
                                <Menu
                                    visible={toMenuVisible}
                                    onDismiss={() => setToMenuVisible(false)}
                                    anchor={
                                        <Button
                                            mode="outlined"
                                            onPress={() => setToMenuVisible(true)}
                                            style={styles.languageButton}
                                            contentStyle={styles.languageButtonContent}
                                        >
                                            {languages.find(lang => lang.value === toLanguage)?.flag} {toLanguage}
                                        </Button>
                                    }
                                >
                                    {languages.map((language) => (
                                        <Menu.Item
                                            key={language.value}
                                            onPress={() => {
                                                setToLanguage(language.value);
                                                setToMenuVisible(false);
                                            }}
                                            title={`${language.flag} ${language.label}`}
                                        />
                                    ))}
                                </Menu>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
                <Card style={styles.card} elevation={2}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Enter Text to Translate</Title>
                        <TextInput
                            mode="outlined"
                            label="Text to translate"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            numberOfLines={4}
                            style={styles.textInput}
                            placeholder="Type your message here..."
                        />
                        <View style={styles.inputActions}>
                            <Button
                                mode="outlined"
                                onPress={clearText}
                                icon="close"
                                compact
                                style={styles.clearButton}
                            >
                                Clear
                            </Button>
                            <Paragraph style={styles.charCount}>{inputText.length}/500</Paragraph>
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
                    icon={isLoading ? "loading" : "translate"}
                    loading={isLoading}
                >
                    {isLoading ? 'Translating...' : 'Translate'}
                </Button>
                {translatedText ? (
                    <Card style={styles.card} elevation={2}>
                        <Card.Content>
                            <View style={styles.resultHeader}>
                                <Title style={styles.cardTitle}>Translation Result</Title>
                                <Button
                                    mode="outlined"
                                    onPress={() => {
                                        setSnackbarMessage('Text copied to clipboard!');
                                        setSnackbarVisible(true);
                                    }}
                                    icon="content-copy"
                                    compact
                                >
                                    Copy
                                </Button>
                            </View>
                            <Divider style={styles.divider} />
                            <Paragraph style={styles.translatedText}>{translatedText}</Paragraph>
                        </Card.Content>
                    </Card>
                ) : null}
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
            </ScrollView>
        </PaperProvider>
    );
};

export default TranslateApp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingBottom: 32,
    },
    headerGradient: {
        backgroundColor: '#667eea',
        paddingTop: 60,
        paddingBottom: 30,
        marginBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    headerIcon: {
        marginHorizontal: 10,
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500',
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 15,
    },
    card: {
        marginBottom: 16,
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    languageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    languageBox: {
        flex: 1,
        marginHorizontal: 8,
    },
    languageLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#666',
    },
    languageButton: {
        borderColor: '#6200ea',
        borderRadius: 8,
    },
    languageButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    swapButton: {
        marginHorizontal: 8,
        borderColor: '#6200ea',
    },
    textInput: {
        marginBottom: 12,
    },
    inputActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    clearButton: {
        borderColor: '#f44336',
    },
    charCount: {
        fontSize: 12,
        color: '#666',
    },
    translateButton: {
        marginVertical: 16,
        marginHorizontal: 16,
        backgroundColor: '#667eea',
        borderRadius: 25,
        paddingVertical: 8,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    divider: {
        marginBottom: 12,
    },
    translatedText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
});



