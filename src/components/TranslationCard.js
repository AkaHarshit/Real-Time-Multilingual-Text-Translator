import React, { useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { Text, TextInput, Button, IconButton, Card, Divider, Menu, useTheme } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { translateTextApi } from '../utils/api';
import { addToHistory, toggleFavorite } from '../utils/storage';

const TranslationCard = ({ fromLanguage, setFromLanguage, toLanguage, setToLanguage, languages, onSwapLanguages }) => {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fromMenuVisible, setFromMenuVisible] = useState(false);
    const [toMenuVisible, setToMenuVisible] = useState(false);
    const theme = useTheme();

    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        Keyboard.dismiss();
        setIsLoading(true);
        try {
            const result = await translateTextApi(inputText, fromLanguage.value, toLanguage.value);
            setTranslatedText(result);
            await addToHistory({
                original: inputText,
                translated: result,
                from: fromLanguage.value,
                to: toLanguage.value
            });
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
    };

    const speakText = (text, langCode) => {
        Speech.speak(text, { language: langCode });
    };

    const handleSaveFavorite = async () => {
        if (!translatedText) return;
        await toggleFavorite({
            original: inputText,
            translated: translatedText,
            from: fromLanguage.value,
            to: toLanguage.value,
            timestamp: new Date().toISOString()
        });
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content style={styles.languageContainer}>
                    <Menu
                        visible={fromMenuVisible}
                        onDismiss={() => setFromMenuVisible(false)}
                        anchor={
                            <Button mode="text" onPress={() => setFromMenuVisible(true)}>
                                {fromLanguage.flag} {fromLanguage.value}
                            </Button>
                        }
                    >
                        {languages.map((lang) => (
                            <Menu.Item key={lang.value} onPress={() => { setFromLanguage(lang); setFromMenuVisible(false); }} title={`${lang.flag} ${lang.label}`} />
                        ))}
                    </Menu>

                    <IconButton icon="swap-horizontal" onPress={onSwapLanguages} />

                    <Menu
                        visible={toMenuVisible}
                        onDismiss={() => setToMenuVisible(false)}
                        anchor={
                            <Button mode="text" onPress={() => setToMenuVisible(true)}>
                                {toLanguage.flag} {toLanguage.value}
                            </Button>
                        }
                    >
                        {languages.map((lang) => (
                            <Menu.Item key={lang.value} onPress={() => { setToLanguage(lang); setToMenuVisible(false); }} title={`${lang.flag} ${lang.label}`} />
                        ))}
                    </Menu>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <TextInput
                        mode="outlined"
                        placeholder="Enter text"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        numberOfLines={4}
                        style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
                        right={<TextInput.Icon icon="close" onPress={() => { setInputText(''); setTranslatedText(''); }} />}
                    />
                    <View style={styles.actionRow}>
                        <Text style={{ color: theme.colors.outline }}>{inputText.length}/500</Text>
                        <View style={styles.actionButtons}>
                            <IconButton icon="content-copy" size={20} onPress={() => copyToClipboard(inputText)} />
                            <IconButton icon="volume-high" size={20} onPress={() => speakText(inputText, fromLanguage.code)} />
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={handleTranslate}
                loading={isLoading}
                disabled={isLoading || !inputText.trim()}
                style={styles.translateButton}
            >
                {isLoading ? 'Translating...' : 'Translate'}
            </Button>

            {translatedText ? (
                <Card style={[styles.resultCard, { borderLeftColor: theme.colors.secondary }]}>
                    <Card.Content>
                        <View style={styles.resultHeader}>
                            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>Translation</Text>
                            <View style={styles.actionButtons}>
                                <IconButton icon="content-copy" size={20} onPress={() => copyToClipboard(translatedText)} />
                                <IconButton icon="volume-high" size={20} onPress={() => speakText(translatedText, toLanguage.code)} />
                                <IconButton icon="star-outline" size={20} onPress={handleSaveFavorite} />
                            </View>
                        </View>
                        <Divider style={styles.divider} />
                        <Text variant="bodyLarge" style={styles.translatedText}>{translatedText}</Text>
                    </Card.Content>
                </Card>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 16,
        elevation: 2,
    },
    languageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    textInput: {
        fontSize: 16,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    translateButton: {
        marginVertical: 8,
        borderRadius: 25,
        paddingVertical: 6,
    },
    resultCard: {
        marginTop: 16,
        borderRadius: 16,
        elevation: 4,
        borderLeftWidth: 5,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    divider: {
        marginVertical: 8,
    },
    translatedText: {
        lineHeight: 24,
    },
});

export default TranslationCard;
