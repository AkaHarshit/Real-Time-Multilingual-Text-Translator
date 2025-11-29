import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'translationHistory';
const FAVORITES_KEY = 'translationFavorites';
const SETTINGS_KEY = 'appSettings';

export const getHistory = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading history', e);
        return [];
    }
};

export const saveHistory = async (history) => {
    try {
        const jsonValue = JSON.stringify(history);
        await AsyncStorage.setItem(HISTORY_KEY, jsonValue);
    } catch (e) {
        console.error('Error saving history', e);
    }
};

export const addToHistory = async (item) => {
    const history = await getHistory();
    const newItem = { ...item, id: Date.now().toString(), timestamp: new Date().toISOString() };
    const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    await saveHistory(updatedHistory);
    return updatedHistory;
};

export const getFavorites = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading favorites', e);
        return [];
    }
};

export const saveFavorites = async (favorites) => {
    try {
        const jsonValue = JSON.stringify(favorites);
        await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
    } catch (e) {
        console.error('Error saving favorites', e);
    }
};

export const toggleFavorite = async (item) => {
    const favorites = await getFavorites();
    const index = favorites.findIndex(f => f.original === item.original && f.translated === item.translated);
    let updatedFavorites;
    if (index >= 0) {
        updatedFavorites = favorites.filter((_, i) => i !== index);
    } else {
        updatedFavorites = [item, ...favorites];
    }
    await saveFavorites(updatedFavorites);
    return updatedFavorites;
};

export const getSettings = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : { theme: 'light', fontSize: 1 };
    } catch (e) {
        console.error('Error reading settings', e);
        return { theme: 'light', fontSize: 1 };
    }
};

export const saveSettings = async (settings) => {
    try {
        const jsonValue = JSON.stringify(settings);
        await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
    } catch (e) {
        console.error('Error saving settings', e);
    }
};

export const clearHistory = async () => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
        return [];
    } catch (e) {
        console.error('Error clearing history', e);
        return [];
    }
};

export const clearFavorites = async () => {
    try {
        await AsyncStorage.removeItem(FAVORITES_KEY);
        return [];
    } catch (e) {
        console.error('Error clearing favorites', e);
        return [];
    }
};

export const deleteHistoryItem = async (itemId) => {
    try {
        const history = await getHistory();
        const updatedHistory = history.filter(item => item.id !== itemId);
        await saveHistory(updatedHistory);
        return updatedHistory;
    } catch (e) {
        console.error('Error deleting history item', e);
        return [];
    }
};
