import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, ScrollView, Animated, TouchableOpacity, Share } from 'react-native';
import { Text, TextInput, Button, IconButton, Card, Divider, Menu, useTheme, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { translateTextApi } from '../utils/api';
import { addToHistory, toggleFavorite, getHistory } from '../utils/storage';

const TranslationCard = ({ fromLanguage, setFromLanguage, toLanguage, setToLanguage, languages, onSwapLanguages }) => {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fromMenuVisible, setFromMenuVisible] = useState(false);
    const [toMenuVisible, setToMenuVisible] = useState(false);
    const [recentTranslations, setRecentTranslations] = useState([]);
    const [copied, setCopied] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [errorMessage, setErrorMessage] = useState('');
    const theme = useTheme();
    const isDarkTheme = theme.dark;

    useEffect(() => {
        loadRecentTranslations();
    }, []);

    useEffect(() => {
        if (translatedText) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [translatedText]);

    const loadRecentTranslations = async () => {
        const history = await getHistory();
        setRecentTranslations(history.slice(0, 3));
    };

    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        Keyboard.dismiss();
        setIsLoading(true);
        setErrorMessage('');
        setTranslatedText('');
        try {
            const result = await translateTextApi(inputText, fromLanguage.value, toLanguage.value);
            setTranslatedText(result);
            setErrorMessage('');
            await addToHistory({
                original: inputText,
                translated: result,
                from: fromLanguage.value,
                to: toLanguage.value
            });
            await loadRecentTranslations();
        } catch (error) {
            console.error('Translation error:', error);
            setErrorMessage(error.message || 'Translation failed. Please try again.');
            setTranslatedText('');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareTranslation = async () => {
        if (!translatedText) return;
        try {
            await Share.share({
                message: `${inputText}\n\n${translatedText}\n\n(${fromLanguage.value} → ${toLanguage.value})`,
                title: 'Translation'
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const getWordCount = (text) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const handleRecentClick = (item) => {
        setInputText(item.original);
        setTranslatedText(item.translated);
        setFromLanguage(languages.find(l => l.value === item.from) || fromLanguage);
        setToLanguage(languages.find(l => l.value === item.to) || toLanguage);
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Recent Translations */}
                {recentTranslations.length > 0 && (
                    <View style={styles.recentSection}>
                        <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface, fontSize: 16 }]}>
                            Recent Translations
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
                            {recentTranslations.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id || index}
                                    onPress={() => handleRecentClick(item)}
                                    activeOpacity={0.7}
                                >
                                    <Card style={[styles.recentCard, { backgroundColor: theme.colors.surface, elevation: isDarkTheme ? 0 : 2 }]}>
                                        <Card.Content style={styles.recentCardContent}>
                                            <View style={styles.recentHeader}>
                                                <Chip 
                                                    icon="translate" 
                                                    style={[styles.recentChip, { backgroundColor: theme.colors.primaryContainer }]}
                                                    textStyle={{ fontSize: 12, color: theme.colors.onPrimaryContainer, fontWeight: '600' }}
                                                >
                                                    {item.from} → {item.to}
                                                </Chip>
                                            </View>
                                            <Text 
                                                variant="bodySmall" 
                                                numberOfLines={2} 
                                                style={[styles.recentText, { color: theme.colors.onSurface, fontSize: 14, lineHeight: 20 }]}
                                            >
                                                {item.original}
                                            </Text>
                                        </Card.Content>
                                    </Card>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Language Selector Card */}
                <Card style={[styles.card, styles.languageCard, { backgroundColor: theme.colors.surface, elevation: isDarkTheme ? 0 : 3 }]}>
                    <Card.Content style={styles.languageContainer}>
                        <TouchableOpacity
                            onPress={() => setFromMenuVisible(true)}
                            style={[styles.languageButton, { backgroundColor: theme.colors.primaryContainer, opacity: 0.4 }]}
                            activeOpacity={0.7}
                        >
                            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                {fromLanguage.flag}
                            </Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginLeft: 8, fontSize: 15 }}>
                                {fromLanguage.value}
                            </Text>
                            <IconButton 
                                icon="chevron-down" 
                                size={20}
                                iconColor={theme.colors.primary}
                                style={{ margin: 0 }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onSwapLanguages}
                            style={[styles.swapButton, { backgroundColor: theme.colors.primary }]}
                            activeOpacity={0.8}
                        >
                            <IconButton 
                                icon="swap-horizontal" 
                                iconColor="#fff"
                                size={24}
                                style={{ margin: 0 }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setToMenuVisible(true)}
                            style={[styles.languageButton, { backgroundColor: theme.colors.secondaryContainer, opacity: 0.4 }]}
                            activeOpacity={0.7}
                        >
                            <Text variant="titleMedium" style={{ color: theme.colors.secondary, fontWeight: '600' }}>
                                {toLanguage.flag}
                            </Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginLeft: 8, fontSize: 15 }}>
                                {toLanguage.value}
                            </Text>
                            <IconButton 
                                icon="chevron-down" 
                                size={20}
                                iconColor={theme.colors.secondary}
                                style={{ margin: 0 }}
                            />
                        </TouchableOpacity>
                    </Card.Content>
                </Card>

                <Menu
                    visible={fromMenuVisible}
                    onDismiss={() => setFromMenuVisible(false)}
                    anchor={<View />}
                    contentStyle={{ backgroundColor: theme.colors.surface, maxHeight: 400 }}
                >
                    {languages.map((lang) => (
                        <Menu.Item 
                            key={lang.value} 
                            onPress={() => { setFromLanguage(lang); setFromMenuVisible(false); }} 
                            title={`${lang.flag} ${lang.label}`}
                            titleStyle={{ color: theme.colors.onSurface }}
                        />
                    ))}
                </Menu>

                <Menu
                    visible={toMenuVisible}
                    onDismiss={() => setToMenuVisible(false)}
                    anchor={<View />}
                    contentStyle={{ backgroundColor: theme.colors.surface, maxHeight: 400 }}
                >
                    {languages.map((lang) => (
                        <Menu.Item 
                            key={lang.value} 
                            onPress={() => { setToLanguage(lang); setToMenuVisible(false); }} 
                            title={`${lang.flag} ${lang.label}`}
                            titleStyle={{ color: theme.colors.onSurface }}
                        />
                    ))}
                </Menu>

                {/* Input Card */}
                <Card style={[styles.card, { backgroundColor: theme.colors.surface, elevation: isDarkTheme ? 0 : 3 }]}>
                    <Card.Content>
                        <View style={styles.inputHeader}>
                            <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 16 }}>
                                {fromLanguage.flag} {fromLanguage.value}
                            </Text>
                            <View style={styles.statsRow}>
                                <Chip 
                                    icon="text" 
                                    style={[styles.statChip, { backgroundColor: theme.colors.primaryContainer }]}
                                    textStyle={{ fontSize: 11, color: theme.colors.onPrimaryContainer }}
                                >
                                    {getWordCount(inputText)} words
                                </Chip>
                                <Chip 
                                    icon="format-text" 
                                    style={[styles.statChip, { backgroundColor: theme.colors.secondaryContainer }]}
                                    textStyle={{ fontSize: 11, color: theme.colors.onSecondaryContainer }}
                                >
                                    {inputText.length}/500
                                </Chip>
                            </View>
                        </View>
                        <TextInput
                            mode="outlined"
                            placeholder="Type or paste text to translate..."
                            placeholderTextColor={theme.colors.onSurfaceVariant}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            numberOfLines={5}
                            style={[styles.textInput]}
                            textColor={theme.colors.onSurface}
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                            right={<TextInput.Icon icon="close-circle" onPress={() => { setInputText(''); setTranslatedText(''); }} />}
                        />
                        <View style={styles.actionRow}>
                            <View style={styles.actionButtons}>
                                <IconButton 
                                    icon={copied ? "check-circle" : "content-copy"} 
                                    size={22} 
                                    onPress={() => copyToClipboard(inputText)}
                                    iconColor={copied ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                />
                                <IconButton 
                                    icon="volume-high" 
                                    size={22} 
                                    onPress={() => speakText(inputText, fromLanguage.code)}
                                    iconColor={theme.colors.onSurfaceVariant}
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Translate Button */}
                <TouchableOpacity
                    onPress={handleTranslate}
                    disabled={isLoading || !inputText.trim()}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={isLoading || !inputText.trim() 
                            ? [theme.colors.surfaceVariant, theme.colors.surfaceVariant]
                            : [theme.colors.primary, theme.colors.primary + 'DD']
                        }
                        style={styles.translateButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.translateButtonContent}>
                            {isLoading ? (
                                <>
                                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.translateButtonText}>Translating...</Text>
                                </>
                            ) : (
                                <>
                                    <IconButton icon="translate" iconColor="#fff" size={24} style={{ margin: 0 }} />
                                    <Text style={styles.translateButtonText}>Translate</Text>
                                </>
                            )}
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Error Message */}
                {errorMessage ? (
                    <Card style={[
                        styles.errorCard,
                        {
                            backgroundColor: theme.colors.errorContainer,
                            elevation: isDarkTheme ? 0 : 2,
                            marginTop: 12,
                        }
                    ]}>
                        <Card.Content style={styles.errorContent}>
                            <View style={styles.errorRow}>
                                <IconButton 
                                    icon="alert-circle" 
                                    iconColor={theme.colors.onErrorContainer}
                                    size={24}
                                    style={{ margin: 0 }}
                                />
                                <View style={styles.errorTextContainer}>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer, fontSize: 15, fontWeight: '600' }}>
                                        Translation Error
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer, fontSize: 14, marginTop: 4 }}>
                                        {errorMessage}
                                    </Text>
                                </View>
                                <IconButton 
                                    icon="close" 
                                    iconColor={theme.colors.onErrorContainer}
                                    size={20}
                                    onPress={() => setErrorMessage('')}
                                    style={{ margin: 0 }}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                ) : null}

                {/* Translation Result */}
                {translatedText ? (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <Card style={[
                            styles.resultCard, 
                            { 
                                backgroundColor: theme.colors.surface,
                                elevation: isDarkTheme ? 0 : 4,
                                borderWidth: isDarkTheme ? 1 : 0,
                                borderColor: theme.colors.outline,
                                borderLeftWidth: 4,
                                borderLeftColor: theme.colors.secondary
                            }
                        ]}>
                            <Card.Content>
                                <View style={styles.resultHeader}>
                                    <View style={styles.resultTitleRow}>
                                        <Text variant="titleMedium" style={{ color: theme.colors.secondary, fontWeight: '600', fontSize: 18 }}>
                                            {toLanguage.flag} {toLanguage.value}
                                        </Text>
                                        <Chip 
                                            icon="text" 
                                            style={[styles.statChip, { backgroundColor: theme.colors.secondaryContainer }]}
                                            textStyle={{ fontSize: 11, color: theme.colors.onSecondaryContainer }}
                                        >
                                            {getWordCount(translatedText)} words
                                        </Chip>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <IconButton 
                                            icon={copied ? "check-circle" : "content-copy"} 
                                            size={22} 
                                            onPress={() => copyToClipboard(translatedText)}
                                            iconColor={copied ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                        />
                                        <IconButton 
                                            icon="share-variant" 
                                            size={22} 
                                            onPress={shareTranslation}
                                            iconColor={theme.colors.onSurfaceVariant}
                                        />
                                        <IconButton 
                                            icon="volume-high" 
                                            size={22} 
                                            onPress={() => speakText(translatedText, toLanguage.code)}
                                            iconColor={theme.colors.onSurfaceVariant}
                                        />
                                        <IconButton 
                                            icon="star-outline" 
                                            size={22} 
                                            onPress={handleSaveFavorite}
                                            iconColor={theme.colors.onSurfaceVariant}
                                        />
                                    </View>
                                </View>
                                <Divider style={[styles.divider, { backgroundColor: theme.colors.outline, opacity: 0.3, marginVertical: 12 }]} />
                                <Text variant="bodyLarge" style={[styles.translatedText, { color: theme.colors.onSurface, lineHeight: 26, fontSize: 16 }]}>
                                    {translatedText}
                                </Text>
                            </Card.Content>
                        </Card>
                    </Animated.View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    recentSection: {
        marginBottom: 20,
        marginTop: 8,
    },
    sectionTitle: {
        marginBottom: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        fontSize: 16,
    },
    recentScroll: {
        marginHorizontal: -4,
    },
    recentCard: {
        marginRight: 12,
        borderRadius: 12,
        minWidth: 200,
        maxWidth: 200,
    },
    recentCardContent: {
        padding: 14,
    },
    recentHeader: {
        marginBottom: 10,
    },
    recentChip: {
        height: 28,
    },
    recentText: {
        lineHeight: 20,
        fontSize: 14,
    },
    card: {
        marginBottom: 16,
        borderRadius: 20,
    },
    languageCard: {
        marginBottom: 20,
    },
    languageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    languageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginHorizontal: 4,
    },
    swapButton: {
        borderRadius: 20,
        padding: 8,
        marginHorizontal: 8,
    },
    inputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statChip: {
        height: 28,
    },
    textInput: {
        fontSize: 16,
        minHeight: 120,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 12,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    translateButton: {
        marginVertical: 12,
        borderRadius: 16,
        paddingVertical: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    translateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    translateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    resultCard: {
        marginTop: 16,
        borderRadius: 20,
    },
    resultHeader: {
        marginBottom: 8,
    },
    resultTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    divider: {
        marginVertical: 8,
    },
    translatedText: {
        lineHeight: 26,
        fontSize: 16,
    },
    errorCard: {
        borderRadius: 16,
        marginBottom: 12,
    },
    errorContent: {
        paddingVertical: 8,
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorTextContainer: {
        flex: 1,
        marginLeft: 8,
    },
});

export default TranslationCard;
