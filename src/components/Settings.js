import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch, List, Divider, RadioButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const Settings = ({ isDarkTheme, setIsDarkTheme, fontSize, setFontSize }) => {
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <List.Section>
                    <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>Appearance</List.Subheader>
                <List.Item
                    title="Dark Theme"
                        titleStyle={{ color: theme.colors.onSurface }}
                        left={() => <List.Icon icon="theme-light-dark" iconColor={theme.colors.primary} />}
                        right={() => (
                            <Switch 
                                value={isDarkTheme} 
                                onValueChange={setIsDarkTheme}
                                thumbColor={isDarkTheme ? theme.colors.primary : theme.colors.surfaceVariant}
                                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                            />
                        )}
                        style={{ backgroundColor: theme.colors.surface }}
                />
            </List.Section>
                <Divider style={{ backgroundColor: theme.colors.outline + '20' }} />
            <List.Section>
                    <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>Font Size</List.Subheader>
                <RadioButton.Group onValueChange={value => setFontSize(value)} value={fontSize}>
                    <List.Item
                        title="Small"
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={() => (
                                <RadioButton 
                                    value={0.8} 
                                    uncheckedColor={theme.colors.onSurfaceVariant}
                                    color={theme.colors.primary}
                                />
                            )}
                            style={{ backgroundColor: theme.colors.surface }}
                    />
                    <List.Item
                        title="Medium"
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={() => (
                                <RadioButton 
                                    value={1} 
                                    uncheckedColor={theme.colors.onSurfaceVariant}
                                    color={theme.colors.primary}
                                />
                            )}
                            style={{ backgroundColor: theme.colors.surface }}
                    />
                    <List.Item
                        title="Large"
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={() => (
                                <RadioButton 
                                    value={1.2} 
                                    uncheckedColor={theme.colors.onSurfaceVariant}
                                    color={theme.colors.primary}
                                />
                            )}
                            style={{ backgroundColor: theme.colors.surface }}
                    />
                </RadioButton.Group>
            </List.Section>
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
});

export default Settings;
