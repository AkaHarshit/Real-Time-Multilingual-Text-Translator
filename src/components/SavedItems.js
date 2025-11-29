import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Share, Alert } from 'react-native';
import { Text, IconButton, SegmentedButtons, Searchbar, Divider, useTheme, Card, Chip, Menu, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHistory, getFavorites, toggleFavorite, clearHistory, clearFavorites, deleteHistoryItem } from '../utils/storage';
import * as Clipboard from 'expo-clipboard';

const SavedItems = ({ onSelectTranslation }) => {
    const [value, setValue] = useState('history');
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [itemMenuVisible, setItemMenuVisible] = useState({});
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

    const shareItem = async (item) => {
        try {
            await Share.share({
                message: `${item.original}\n\n${item.translated}\n\n(${item.from} → ${item.to})`,
                title: 'Translation'
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleClearAll = () => {
        Alert.alert(
            `Clear ${value === 'history' ? 'History' : 'Favorites'}`,
            `Are you sure you want to clear all ${value === 'history' ? 'history' : 'favorites'}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        if (value === 'history') {
                            await clearHistory();
                        } else {
                            await clearFavorites();
                        }
                        loadItems();
                    }
                }
            ]
        );
    };

    const handleDeleteItem = (itemId) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteHistoryItem(itemId);
                        loadItems();
                    }
                }
            ]
        );
    };

    const exportData = () => {
        const exportText = filteredItems.map(item => 
            `${item.from} → ${item.to}\n${item.original}\n${item.translated}\n${new Date(item.timestamp).toLocaleString()}\n\n`
        ).join('---\n\n');
        
        Share.share({
            message: exportText,
            title: `Export ${value === 'history' ? 'History' : 'Favorites'}`
        });
    };

    const filteredItems = items.filter(item =>
        item.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translated.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isDarkTheme = theme.dark;

    const renderItem = ({ item }) => (
        <Card style={[
            styles.itemCard, 
            { 
                backgroundColor: theme.colors.surface,
                elevation: isDarkTheme ? 0 : 3,
                borderWidth: isDarkTheme ? 1 : 0,
                borderColor: theme.colors.outline
            }
        ]}>
            <Card.Content>
                <View style={styles.itemHeader}>
                    <Chip 
                        icon="translate" 
                        style={[styles.langChip, { backgroundColor: theme.colors.primaryContainer }]}
                        textStyle={{ fontSize: 11, color: theme.colors.onPrimaryContainer }}
                    >
                        {item.from} → {item.to}
                    </Chip>
                    <View style={styles.itemMenu}>
                        <Menu
                            visible={itemMenuVisible[item.id] || false}
                            onDismiss={() => setItemMenuVisible({ ...itemMenuVisible, [item.id]: false })}
                            anchor={
                                <IconButton
                                    icon="dots-vertical"
                                    size={20}
                                    onPress={() => setItemMenuVisible({ ...itemMenuVisible, [item.id]: true })}
                                    iconColor={theme.colors.onSurfaceVariant}
                                />
                            }
                            contentStyle={{ backgroundColor: theme.colors.surface }}
                        >
                            <Menu.Item
                                onPress={() => {
                                    copyToClipboard(item.translated);
                                    setItemMenuVisible({ ...itemMenuVisible, [item.id]: false });
                                }}
                                title="Copy Translation"
                                leadingIcon="content-copy"
                            />
                            <Menu.Item
                                onPress={() => {
                                    shareItem(item);
                                    setItemMenuVisible({ ...itemMenuVisible, [item.id]: false });
                                }}
                                title="Share"
                                leadingIcon="share-variant"
                            />
                            <Menu.Item
                                onPress={() => {
                                    handleToggleFavorite(item);
                                    setItemMenuVisible({ ...itemMenuVisible, [item.id]: false });
                                }}
                                title={value === 'favorites' ? 'Remove from Favorites' : 'Add to Favorites'}
                                leadingIcon={value === 'favorites' ? "star-off" : "star"}
                            />
                            {value === 'history' && (
                                <Menu.Item
                                    onPress={() => {
                                        handleDeleteItem(item.id);
                                        setItemMenuVisible({ ...itemMenuVisible, [item.id]: false });
                                    }}
                                    title="Delete"
                                    leadingIcon="delete"
                                    titleStyle={{ color: theme.colors.error }}
                                />
                            )}
                        </Menu>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => onSelectTranslation(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.itemContent}>
                        <Text variant="bodyMedium" numberOfLines={3} style={[styles.originalText, { color: theme.colors.onSurfaceVariant }]}>
                            {item.original}
                        </Text>
                        <Text variant="bodyLarge" numberOfLines={3} style={[styles.translatedText, { color: theme.colors.onSurface }]}>
                            {item.translated}
                        </Text>
                        <Text variant="labelSmall" style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
                            {new Date(item.timestamp).toLocaleString()}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.itemActions}>
                    <IconButton 
                        icon="content-copy" 
                        size={20} 
                        onPress={() => copyToClipboard(item.translated)}
                        iconColor={theme.colors.primary}
                    />
                    <IconButton
                        icon="share-variant"
                        size={20}
                        onPress={() => shareItem(item)}
                        iconColor={theme.colors.secondary}
                    />
                    <IconButton
                        icon={value === 'favorites' ? "star" : "star-outline"}
                        iconColor={value === 'favorites' ? "#FFD700" : theme.colors.onSurfaceVariant}
                        size={20}
                        onPress={() => handleToggleFavorite(item)}
                    />
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
            <View style={styles.headerSection}>
                <SegmentedButtons
                    value={value}
                    onValueChange={setValue}
                    buttons={[
                        { value: 'history', label: 'History', icon: 'history' },
                        { value: 'favorites', label: 'Favorites', icon: 'star' },
                    ]}
                    style={styles.segmentedButton}
                />
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <IconButton
                            icon="dots-vertical"
                            size={24}
                            onPress={() => setMenuVisible(true)}
                            iconColor={theme.colors.onSurface}
                        />
                    }
                    contentStyle={{ backgroundColor: theme.colors.surface }}
                >
                    <Menu.Item
                        onPress={() => {
                            exportData();
                            setMenuVisible(false);
                        }}
                        title="Export All"
                        leadingIcon="export"
                    />
                    <Menu.Item
                        onPress={() => {
                            handleClearAll();
                            setMenuVisible(false);
                        }}
                        title={`Clear ${value === 'history' ? 'History' : 'Favorites'}`}
                        leadingIcon="delete-sweep"
                        titleStyle={{ color: theme.colors.error }}
                    />
                </Menu>
            </View>
            <Searchbar
                placeholder="Search translations..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[
                    styles.searchBar,
                    { 
                        backgroundColor: theme.colors.surface,
                        elevation: isDarkTheme ? 0 : 2,
                        borderWidth: isDarkTheme ? 1 : 0,
                        borderColor: theme.colors.outline
                    }
                ]}
                iconColor={theme.colors.onSurfaceVariant}
                inputStyle={{ color: theme.colors.onSurface }}
            />
            {filteredItems.length > 0 && (
                <View style={styles.countContainer}>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                    </Text>
                </View>
            )}
            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={item => item.id || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <IconButton
                            icon={value === 'history' ? 'history' : 'star-outline'}
                            size={64}
                            iconColor={theme.colors.onSurfaceVariant}
                        />
                        <Text variant="titleMedium" style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
                            {searchQuery ? 'No results found' : value === 'history' ? 'No translation history' : 'No favorites yet'}
                        </Text>
                        <Text variant="bodySmall" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                            {searchQuery ? 'Try a different search term' : value === 'history' ? 'Your translation history will appear here' : 'Star translations to save them as favorites'}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    segmentedButton: {
        flex: 1,
        marginRight: 8,
    },
    searchBar: {
        marginBottom: 12,
        borderRadius: 16,
    },
    countContainer: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    listContent: {
        paddingBottom: 100,
    },
    itemCard: {
        borderRadius: 16,
        marginBottom: 4,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    langChip: {
        height: 28,
    },
    itemMenu: {
        marginRight: -8,
    },
    itemContent: {
        marginBottom: 12,
    },
    originalText: {
        marginBottom: 8,
        lineHeight: 20,
    },
    translatedText: {
        fontWeight: '600',
        marginBottom: 8,
        lineHeight: 22,
    },
    timestamp: {
        opacity: 0.7,
    },
    itemActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        textAlign: 'center',
        opacity: 0.7,
    },
});

export default SavedItems;
