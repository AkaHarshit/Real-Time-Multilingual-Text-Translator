import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, List, IconButton, SegmentedButtons, Searchbar, Divider, useTheme } from 'react-native-paper';
import { getHistory, getFavorites, toggleFavorite } from '../utils/storage';
import * as Clipboard from 'expo-clipboard';

const SavedItems = ({ onSelectTranslation }) => {
    const [value, setValue] = useState('history');
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useTheme();

    useEffect(() => {
        loadItems();
    }, [value]);

    const loadItems = async () => {
        if (value === 'history') {
            const history = await getHistory();
            setItems(history);
        } else {
            const favorites = await getFavorites();
            setItems(favorites);
        }
    };

    const handleToggleFavorite = async (item) => {
        await toggleFavorite(item);
        loadItems(); 
    };

    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
    };

    const filteredItems = items.filter(item =>
        item.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translated.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <View style={[styles.itemContainer, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
                style={styles.itemContent}
                onPress={() => onSelectTranslation(item)}
            >
                <View style={styles.row}>
                    <Text variant="labelSmall" style={{ color: theme.colors.primary }}>{item.from} → {item.to}</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                </View>
                <Text variant="bodyMedium" numberOfLines={2} style={styles.originalText}>{item.original}</Text>
                <Text variant="bodyMedium" numberOfLines={2} style={[styles.translatedText, { color: theme.colors.secondary }]}>{item.translated}</Text>
            </TouchableOpacity>
            <View style={styles.actions}>
                <IconButton icon="content-copy" size={20} onPress={() => copyToClipboard(item.translated)} />
                <IconButton
                    icon={value === 'favorites' ? "star" : "star-outline"}
                    iconColor={value === 'favorites' ? "#FFD700" : theme.colors.onSurfaceVariant}
                    size={20}
                    onPress={() => handleToggleFavorite(item)}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <SegmentedButtons
                value={value}
                onValueChange={setValue}
                buttons={[
                    { value: 'history', label: 'History', icon: 'history' },
                    { value: 'favorites', label: 'Favorites', icon: 'star' },
                ]}
                style={styles.segmentedButton}
            />
            <Searchbar
                placeholder="Search..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />
            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={item => item.id || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <Divider style={{ marginVertical: 8 }} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    segmentedButton: {
        marginBottom: 16,
    },
    searchBar: {
        marginBottom: 16,
        elevation: 2,
    },
    listContent: {
        paddingBottom: 80,
    },
    itemContainer: {
        borderRadius: 12,
        padding: 12,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemContent: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    originalText: {
        marginBottom: 4,
    },
    translatedText: {
        fontWeight: 'bold',
    },
    actions: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SavedItems;
