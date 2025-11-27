import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, List, Divider, RadioButton } from 'react-native-paper';

const Settings = ({ isDarkTheme, setIsDarkTheme, fontSize, setFontSize }) => {
    return (
        <View style={styles.container}>
            <List.Section>
                <List.Subheader>Appearance</List.Subheader>
                <List.Item
                    title="Dark Theme"
                    left={() => <List.Icon icon="theme-light-dark" />}
                    right={() => <Switch value={isDarkTheme} onValueChange={setIsDarkTheme} />}
                />
            </List.Section>
            <Divider />
            <List.Section>
                <List.Subheader>Font Size</List.Subheader>
                <RadioButton.Group onValueChange={value => setFontSize(value)} value={fontSize}>
                    <List.Item
                        title="Small"
                        left={() => <RadioButton value={0.8} />}
                    />
                    <List.Item
                        title="Medium"
                        left={() => <RadioButton value={1} />}
                    />
                    <List.Item
                        title="Large"
                        left={() => <RadioButton value={1.2} />}
                    />
                </RadioButton.Group>
            </List.Section>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});

export default Settings;
