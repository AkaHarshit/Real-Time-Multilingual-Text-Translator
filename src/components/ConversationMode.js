import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton, ActivityIndicator, useTheme, Card, Avatar } from 'react-native-paper';
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


    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                ref={ref => ref?.scrollToEnd({ animated: true })}
            >
                {messages.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={{ color: theme.colors.outline }}>Start a conversation...</Text>
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
                                isFrom ? { backgroundColor: theme.colors.primaryContainer } : { backgroundColor: theme.colors.secondaryContainer }
                            ]}>
                                <Card.Content style={styles.bubbleContent}>
                                    <Text variant="bodyMedium" style={styles.originalText}>{msg.text}</Text>
                                    {msg.isTranslated ? (
                                        <Text variant="bodyLarge" style={styles.translatedText}>{msg.translatedText}</Text>
                                    ) : (
                                        <ActivityIndicator size="small" />
                                    )}
                                </Card.Content>
                            </Card>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={[styles.inputArea, { backgroundColor: theme.colors.surface }]}>
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
            {currentSpeaker && (
                <View style={styles.inputOverlay}>
                    <View style={[styles.inputBox, { backgroundColor: theme.colors.surface }]}>
                        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                            Speaking: {currentSpeaker === 'from' ? fromLanguage.value : toLanguage.value}
                        </Text>
                        <InputComponent
                            onSubmit={(text) => {
                                handleSend(text, currentSpeaker);
                                setCurrentSpeaker(null);
                            }}
                            onCancel={() => setCurrentSpeaker(null)}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};
import { TextInput, Button } from 'react-native-paper';
const InputComponent = ({ onSubmit, onCancel }) => {
    const [text, setText] = useState('');
    return (
        <View>
            <TextInput
                autoFocus
                value={text}
                onChangeText={setText}
                placeholder="Type here..."
                mode="outlined"
                style={{ marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button onPress={onCancel}>Cancel</Button>
                <Button mode="contained" onPress={() => onSubmit(text)}>Send</Button>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    inputBox: {
        padding: 20,
        borderRadius: 16,
        elevation: 5,
    },
});

export default ConversationMode;
