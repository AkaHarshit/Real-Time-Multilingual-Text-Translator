import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton, ActivityIndicator, useTheme, Card, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { translateTextApi } from '../utils/api';

const ConversationMode = ({ fromLanguage, toLanguage }) => {
    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState(null); 
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
                {messages.map((msg) => {
                    const isFrom = msg.speaker === 'from';
                    return (
                        <View key={msg.id} style={[
                            styles.messageRow,
                            isFrom ? styles.messageRowLeft : styles.messageRowRight
                        ]}>
                            <Card style={[
                                styles.messageBubble,
                                { 
                                    backgroundColor: isFrom 
                                        ? theme.colors.primaryContainer 
                                        : theme.colors.secondaryContainer,
                                    elevation: isDarkTheme ? 0 : 2,
                                    borderWidth: isDarkTheme ? 1 : 0,
                                    borderColor: theme.colors.outline + '20'
                                }
                            ]}>
                                <Card.Content style={styles.bubbleContent}>
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
                                        <ActivityIndicator size="small" color={theme.colors.primary} />
                                    )}
                                </Card.Content>
                            </Card>
                        </View>
                    );
                })}
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.surface }}>
                <View style={[
                    styles.inputArea, 
                    { 
                        backgroundColor: theme.colors.surface,
                        borderTopWidth: isDarkTheme ? 1 : 0,
                        borderTopColor: theme.colors.outline + '20'
                    }
                ]}>
                    <TouchableOpacity
                        style={[styles.inputButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => {
                            setCurrentSpeaker('from');
                        }}
                    >
                        <Text style={styles.buttonText}>{fromLanguage.value}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.inputButton, { backgroundColor: theme.colors.secondary }]}
                        onPress={() => {
                            setCurrentSpeaker('to');
                        }}
                    >
                        <Text style={styles.buttonText}>{toLanguage.value}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            {currentSpeaker && (
                <View style={[styles.inputOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Card style={[styles.inputBox, { backgroundColor: theme.colors.surface }]}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
                                Speaking: {currentSpeaker === 'from' ? fromLanguage.value : toLanguage.value}
                            </Text>
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
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 8,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
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
