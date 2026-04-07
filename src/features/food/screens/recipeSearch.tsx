import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { foodService } from '../services/food.service';

interface RecipeSummary {
  id: number;
  title: string;
  image: string;
  nutrition: {
    nutrients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
}

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  summary: string;
  extendedIngredients: {
    original: string;
  }[];
  analyzedInstructions: {
    name: string;
    steps: {
      number: number;
      step: string;
    }[];
  }[];
}

export default function RecipeSearchScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchRecipes = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await foodService.searchRecipes(query);
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      Alert.alert('Error', 'No se pudieron buscar recetas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeDetails = async (id: number) => {
    setLoadingDetail(true);
    try {
      const data = await foodService.getRecipeDetails(id);
      setSelectedRecipe(data);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles de la receta.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeRecipe = () => {
    setModalVisible(false);
    setSelectedRecipe(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Buscar Recetas</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
        placeholder="Ej: Pollo, Arroz, Pasta..."
        placeholderTextColor={colors.outline}
        value={query}
        onChangeText={setQuery}
      />
      <Button color={colors.primary} title="Buscar" onPress={fetchRecipes} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => fetchRecipeDetails(item.id)} style={[styles.card, { backgroundColor: colors.card }]}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {loadingDetail && (
        <Modal transparent visible={true}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </Modal>
      )}

      {selectedRecipe && (
        <Modal visible={modalVisible} animationType="slide">
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedRecipe.title}</Text>
              
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredientes:</Text>
              {selectedRecipe.extendedIngredients.map((ing, index) => (
                <Text key={index} style={[styles.text, { color: colors.text }]}>• {ing.original}</Text>
              ))}

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Instrucciones:</Text>
              {selectedRecipe.analyzedInstructions[0]?.steps.map((step) => (
                <Text key={step.number} style={[styles.text, { color: colors.text }]}>
                  {step.number}. {step.step}
                </Text>
              ))}

              <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.primary }]} onPress={closeRecipe}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}

import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 50, borderRadius: 10, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ccc' },
  card: { padding: 15, borderRadius: 12, marginBottom: 15, alignItems: 'center', elevation: 3 },
  image: { width: '100%', height: 150, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContainer: { flex: 1 },
  modalContent: { padding: 20 },
  modalImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  text: { fontSize: 15, marginBottom: 6, lineHeight: 22 },
  closeButton: { marginTop: 30, padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  closeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
