import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Keyboard } from 'react-native';
import { Text, IconButton, ActivityIndicator, useTheme, Card, TextInput, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { translateTextApi } from '../utils/api';

const ConversationMode = ({ fromLanguage, toLanguage }) => {
    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const theme = useTheme();


    const handleSend = async (text, speaker) => {
        if (!text.trim()) return;

        const newMessage = {
            id: Date.now().toString(),
            text: text,
            speaker: speaker,
            isTranslated: false,
        };

        setMessages(prev => [...prev, newMessage]);

        try {
            const sourceLang = speaker === 'from' ? fromLanguage.value : toLanguage.value;
            const targetLang = speaker === 'from' ? toLanguage.value : fromLanguage.value;

            const translatedText = await translateTextApi(text, sourceLang, targetLang);

            setMessages(prev => prev.map(msg =>
                msg.id === newMessage.id
                    ? { ...msg, translatedText: translatedText, isTranslated: true }
                    : msg
            ));

            const speakLang = speaker === 'from' ? toLanguage.code : fromLanguage.code;
            Speech.speak(translatedText, { language: speakLang });

        } catch (error) {
            console.error(error);
        }
    };


    const scrollViewRef = useRef(null);

    useEffect(() => {
        if (messages.length > 0) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [messages]);

    const isDarkTheme = theme.dark;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                keyboardShouldPersistTaps="handled"
            >
                {messages.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>Start a conversation...</Text>
                    </View>
                )}
                {messages.map((msg, index) => {
                    const isFrom = msg.speaker === 'from';
                    return (
                        <Animated.View 
                            key={msg.id} 
                            style={[
                                styles.messageRow,
                                isFrom ? styles.messageRowLeft : styles.messageRowRight,
                                { opacity: fadeAnim }
                            ]}
                        >
                            <Card style={[
                                styles.messageBubble,
                                { 
                                    backgroundColor: isFrom 
                                        ? theme.colors.primaryContainer 
                                        : theme.colors.secondaryContainer,
                                    elevation: isDarkTheme ? 0 : 3,
                                    borderWidth: isDarkTheme ? 1 : 0,
                                    borderColor: theme.colors.outline,
                                    borderLeftWidth: isFrom ? 4 : 0,
                                    borderRightWidth: !isFrom ? 4 : 0,
                                    borderLeftColor: isFrom ? theme.colors.primary : 'transparent',
                                    borderRightColor: !isFrom ? theme.colors.secondary : 'transparent',
                                }
                            ]}>
                                <Card.Content style={styles.bubbleContent}>
                                    <View style={styles.messageHeader}>
                                        <Chip 
                                            icon={isFrom ? fromLanguage.flag : toLanguage.flag}
                                            style={[styles.langChip, { backgroundColor: theme.colors.surface, opacity: 0.8 }]}
                                            textStyle={{ fontSize: 10 }}
                                        >
                                            {isFrom ? fromLanguage.value : toLanguage.value}
                                        </Chip>
                                    </View>
                                    <Text 
                                        variant="bodyMedium" 
                                        style={[styles.originalText, { color: theme.colors.onSurfaceVariant }]}
                                    >
                                        {msg.text}
                                    </Text>
                                    {msg.isTranslated ? (
                                        <Text 
                                            variant="bodyLarge" 
                                            style={[styles.translatedText, { color: theme.colors.onSurface }]}
                                        >
                                            {msg.translatedText}
                                        </Text>
                                    ) : (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="small" color={theme.colors.primary} />
                                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                                                Translating...
                                            </Text>
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>
                        </Animated.View>
                    );
                })}
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.surface }}>
                <View style={[
                    styles.inputArea, 
                    { 
                        backgroundColor: theme.colors.surface,
                        borderTopWidth: isDarkTheme ? 1 : 0,
                        borderTopColor: theme.colors.outline,
                        paddingTop: 12,
                        paddingBottom: 8,
                    }
                ]}>
                    <TouchableOpacity
                        style={[styles.inputButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => {
                            setCurrentSpeaker('from');
                            Keyboard.dismiss();
                        }}
                        activeOpacity={0.8}
                    >
                        <Text variant="titleMedium" style={styles.buttonFlag}>{fromLanguage.flag}</Text>
                        <Text style={styles.buttonText}>{fromLanguage.value}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.inputButton, { backgroundColor: theme.colors.secondary }]}
                        onPress={() => {
                            setCurrentSpeaker('to');
                            Keyboard.dismiss();
                        }}
                        activeOpacity={0.8}
                    >
                        <Text variant="titleMedium" style={styles.buttonFlag}>{toLanguage.flag}</Text>
                        <Text style={styles.buttonText}>{toLanguage.value}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            {currentSpeaker && (
                <View style={[styles.inputOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Card style={[styles.inputBox, { backgroundColor: theme.colors.surface, elevation: 8 }]}>
                        <Card.Content>
                            <View style={styles.inputHeader}>
                                <View style={styles.inputHeaderContent}>
                                    <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                        {currentSpeaker === 'from' ? fromLanguage.flag : toLanguage.flag}
                                    </Text>
                                    <Text variant="titleMedium" style={{ marginLeft: 8, color: theme.colors.onSurface }}>
                                        {currentSpeaker === 'from' ? fromLanguage.value : toLanguage.value}
                                    </Text>
                                </View>
                            </View>
                            <InputComponent
                                onSubmit={(text) => {
                                    handleSend(text, currentSpeaker);
                                    setCurrentSpeaker(null);
                                }}
                                onCancel={() => setCurrentSpeaker(null)}
                            />
                        </Card.Content>
                    </Card>
                </View>
            )}
        </SafeAreaView>
    );
};

const InputComponent = ({ onSubmit, onCancel }) => {
    const [text, setText] = useState('');
    const theme = useTheme();
    return (
        <View>
            <TextInput
                autoFocus
                value={text}
                onChangeText={setText}
                placeholder="Type here..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                mode="outlined"
                style={{ marginBottom: 12 }}
                textColor={theme.colors.onSurface}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <Button 
                    onPress={onCancel}
                    textColor={theme.colors.onSurface}
                >
                    Cancel
                </Button>
                <Button 
                    mode="contained" 
                    onPress={() => onSubmit(text)}
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.onPrimary}
                >
                    Send
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 16,
        paddingBottom: 20,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    messageRowLeft: {
        justifyContent: 'flex-start',
    },
    messageRowRight: {
        justifyContent: 'flex-end',
    },
    messageBubble: {
        maxWidth: '80%',
        borderRadius: 16,
    },
    bubbleContent: {
        padding: 8,
    },
    originalText: {
        opacity: 0.7,
        marginBottom: 4,
        fontSize: 12,
    },
    translatedText: {
        fontWeight: 'bold',
    },
    inputArea: {
        flexDirection: 'row',
        padding: 16,
        elevation: 8,
    },
    inputButton: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 6,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    buttonFlag: {
        marginRight: 8,
        fontSize: 24,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    messageHeader: {
        marginBottom: 8,
    },
    langChip: {
        height: 24,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    inputHeader: {
        marginBottom: 16,
    },
    inputHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        padding: 20,
    },
    inputBox: {
        borderRadius: 16,
        elevation: 8,
    },
});

export default ConversationMode;
