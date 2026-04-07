import { useState } from 'react';
import { Alert } from 'react-native';
import { foodService, Food } from '../services/food.service';

export function useFoodSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Food[] | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchByQuery = async (searchQuery?: string) => {
        const q = searchQuery || query;
        if (!q.trim()) return;

        setLoading(true);
        setShowResults(true);
        try {
            const data = await foodService.searchFood(q);
            setResults(data);
            if (!recentSearches.includes(q.trim())) {
                setRecentSearches(prev => [q.trim(), ...prev.slice(0, 4)]);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo buscar.');
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults(null);
        setShowResults(false);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
    };

    return {
        query,
        setQuery,
        results,
        loading,
        showResults,
        recentSearches,
        searchByQuery,
        clearSearch,
        clearRecentSearches,
        setShowResults
    };
}
