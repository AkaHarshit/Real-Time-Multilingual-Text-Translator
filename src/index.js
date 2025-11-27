import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { Provider as PaperProvider, BottomNavigation, Text, MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TranslationCard from './components/TranslationCard';
import ConversationMode from './components/ConversationMode';
import SavedItems from './components/SavedItems';
import Settings from './components/Settings';
import { getSettings, saveSettings } from './utils/storage';

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
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'home', title: 'Translate', focusedIcon: 'translate', unfocusedIcon: 'translate-off' },
        { key: 'conversation', title: 'Conversation', focusedIcon: 'chat-processing', unfocusedIcon: 'chat-processing-outline' },
        { key: 'saved', title: 'Saved', focusedIcon: 'bookmark', unfocusedIcon: 'bookmark-outline' },
        { key: 'settings', title: 'Settings', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' },
    ]);

    const [fromLanguage, setFromLanguage] = useState(languages[0]);
    const [toLanguage, setToLanguage] = useState(languages[1]);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [fontSizeScale, setFontSizeScale] = useState(1);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await getSettings();
        setIsDarkTheme(settings.theme === 'dark');
        setFontSizeScale(settings.fontSize || 1);
    };

    const handleThemeChange = async (value) => {
        setIsDarkTheme(value);
        await saveSettings({ theme: value ? 'dark' : 'light', fontSize: fontSizeScale });
    };

    const handleFontSizeChange = async (value) => {
        setFontSizeScale(value);
        await saveSettings({ theme: isDarkTheme ? 'dark' : 'light', fontSize: value });
    };

    const swapLanguages = () => {
        const temp = fromLanguage;
        setFromLanguage(toLanguage);
        setToLanguage(temp);
    };

    const baseTheme = isDarkTheme ? MD3DarkTheme : MD3LightTheme;
    const getScaledTheme = (baseTheme, scale) => {
        const scaledFonts = {};
        for (const [variant, style] of Object.entries(baseTheme.fonts)) {
            if (style && style.fontSize) {
                scaledFonts[variant] = {
                    ...style,
                    fontSize: style.fontSize * scale,
                    lineHeight: style.lineHeight ? style.lineHeight * scale : undefined,
                };
            } else {
                scaledFonts[variant] = style;
            }
        }
        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                primary: '#6C63FF',
                secondary: '#03DAC6',
            },
            fonts: configureFonts({ config: scaledFonts }),
        };
    };

    const theme = getScaledTheme(baseTheme, fontSizeScale);

    const renderScene = BottomNavigation.SceneMap({
        home: () => (
            <TranslationCard
                fromLanguage={fromLanguage}
                setFromLanguage={setFromLanguage}
                toLanguage={toLanguage}
                setToLanguage={setToLanguage}
                languages={languages}
                onSwapLanguages={swapLanguages}
            />
        ),
        conversation: () => (
            <ConversationMode
                fromLanguage={fromLanguage}
                toLanguage={toLanguage}
            />
        ),
        saved: () => (
            <SavedItems
                onSelectTranslation={(item) => {
                }}
            />
        ),
        settings: () => (
            <Settings
                isDarkTheme={isDarkTheme}
                setIsDarkTheme={handleThemeChange}
                fontSize={fontSizeScale}
                setFontSize={handleFontSizeChange}
            />
        ),
    });

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent
                />
                <LinearGradient
                    colors={['#6C63FF', '#4834D4']}
                    style={styles.header}
                >
                    <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContent}>
                        <Text variant="headlineMedium" style={styles.headerTitle}>BabelText</Text>
                        <Text variant="bodySmall" style={styles.headerSubtitle}>
                            {routes[index].title}
                        </Text>
                    </SafeAreaView>
                </LinearGradient>

                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <BottomNavigation
                        navigationState={{ index, routes }}
                        onIndexChange={setIndex}
                        renderScene={renderScene}
                        barStyle={{ backgroundColor: theme.colors.surface }}
                    />
                </View>
            </PaperProvider>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
    },
    headerContent: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default TranslateApp;
