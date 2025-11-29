import React from 'react';
import { View, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Text, Switch, List, Divider, RadioButton, useTheme, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const Settings = ({ isDarkTheme, setIsDarkTheme, fontSize, setFontSize }) => {
    const theme = useTheme();
    const isDark = theme.dark;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Appearance Section */}
                <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface, elevation: isDark ? 0 : 2 }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                            Appearance
                        </Text>
                        <List.Item
                            title="Dark Theme"
                            description="Switch between light and dark mode"
                            titleStyle={{ color: theme.colors.onSurface }}
                            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                            left={() => <List.Icon icon="theme-light-dark" iconColor={theme.colors.primary} />}
                            right={() => (
                                <Switch 
                                    value={isDarkTheme} 
                                    onValueChange={setIsDarkTheme}
                                    thumbColor={isDarkTheme ? theme.colors.primary : theme.colors.surfaceVariant}
                                    trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                                />
                            )}
                            style={{ paddingVertical: 8 }}
                        />
                    </Card.Content>
                </Card>

                {/* Font Size Section */}
                <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface, elevation: isDark ? 0 : 2 }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                            Font Size
                        </Text>
                        <Text variant="bodySmall" style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
                            Adjust text size for better readability
                        </Text>
                        <RadioButton.Group onValueChange={value => setFontSize(value)} value={fontSize}>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={[styles.radioOption, { backgroundColor: fontSize === 0.8 ? theme.colors.primaryContainer : 'transparent' }]}
                                    onPress={() => setFontSize(0.8)}
                                >
                                    <RadioButton 
                                        value={0.8} 
                                        uncheckedColor={theme.colors.onSurfaceVariant}
                                        color={theme.colors.primary}
                                    />
                                    <View style={styles.radioContent}>
                                        <Text style={[styles.radioTitle, { color: theme.colors.onSurface }]}>Small</Text>
                                        <Text style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>Compact text</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.radioOption, { backgroundColor: fontSize === 1 ? theme.colors.primaryContainer : 'transparent' }]}
                                    onPress={() => setFontSize(1)}
                                >
                                    <RadioButton 
                                        value={1} 
                                        uncheckedColor={theme.colors.onSurfaceVariant}
                                        color={theme.colors.primary}
                                    />
                                    <View style={styles.radioContent}>
                                        <Text style={[styles.radioTitle, { color: theme.colors.onSurface }]}>Medium</Text>
                                        <Text style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>Default size</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.radioOption, { backgroundColor: fontSize === 1.2 ? theme.colors.primaryContainer : 'transparent' }]}
                                    onPress={() => setFontSize(1.2)}
                                >
                                    <RadioButton 
                                        value={1.2} 
                                        uncheckedColor={theme.colors.onSurfaceVariant}
                                        color={theme.colors.primary}
                                    />
                                    <View style={styles.radioContent}>
                                        <Text style={[styles.radioTitle, { color: theme.colors.onSurface }]}>Large</Text>
                                        <Text style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>Easier to read</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </RadioButton.Group>
                    </Card.Content>
                </Card>

                {/* App Info Section */}
                <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface, elevation: isDark ? 0 : 2 }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                            About
                        </Text>
                        <List.Item
                            title="Version"
                            description="1.0.0"
                            titleStyle={{ color: theme.colors.onSurface }}
                            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                            left={() => <List.Icon icon="information" iconColor={theme.colors.primary} />}
                            style={{ paddingVertical: 8 }}
                        />
                        <Divider style={{ backgroundColor: theme.colors.outline, opacity: 0.2, marginVertical: 8 }} />
                        <List.Item
                            title="BabelText"
                            description="Real-time multilingual text translator"
                            titleStyle={{ color: theme.colors.onSurface }}
                            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                            left={() => <List.Icon icon="translate" iconColor={theme.colors.secondary} />}
                            style={{ paddingVertical: 8 }}
                        />
                    </Card.Content>
                </Card>
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
        paddingBottom: 24,
    },
    sectionCard: {
        marginBottom: 16,
        borderRadius: 20,
    },
    sectionTitle: {
        marginBottom: 8,
        fontWeight: '600',
    },
    sectionDescription: {
        marginBottom: 16,
    },
    radioGroup: {
        marginTop: 8,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    radioContent: {
        flex: 1,
        marginLeft: 8,
    },
    radioTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    radioDescription: {
        fontSize: 12,
        marginTop: 2,
    },
});

export default Settings;
