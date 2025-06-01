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
} from 'react-native';
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
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchRecipes = async () => {
    try {
      const response = await fetch(
        `http://ayasc.ddns.net:3000/api/recipes/search?query=${query}`
      );
      const data = await response.json();
      setRecipes(data.results);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchRecipeDetails = async (id: number) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(
        `http://ayasc.ddns.net:3000/api/recipes/${id}`
      );
      const data = await response.json();
      setSelectedRecipe(data);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openRecipe = (recipe: RecipeSummary) => {
    fetchRecipeDetails(recipe.id);
  };

  const closeRecipe = () => {
    setModalVisible(false);
    setSelectedRecipe(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search Recipes</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Chicken, Rice, Pasta..."
        value={query}
        onChangeText={setQuery}
      />
      <Button color={'#4CAF50'} title="Search" onPress={fetchRecipes} />

      <Text></Text>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openRecipe(item)} style={styles.recipeCard}>
            <Image source={{ uri: item.image }} style={styles.recipeImage} />
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <View style={styles.nutrition}>
              {['Calories', 'Protein', 'Fat', 'Carbohydrates'].map((nutrientName) => {
                const nutrient = item.nutrition?.nutrients.find((n) => n.name === nutrientName);
                return nutrient ? (
                  <Text key={nutrientName} style={styles.nutrientText}>
                    {nutrientName}: {Math.round(nutrient.amount)}{nutrient.unit}
                  </Text>
                ) : null;
              })}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          {loadingDetail && <Text>Loading...</Text>}
          {selectedRecipe && !loadingDetail && (
            <>
              <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
              <Text style={styles.modalSectionTitle}>Summary:</Text>
              <Text style={styles.modalText}>
                {selectedRecipe.summary.replace(/<[^>]+>/g, '')}
              </Text>
              <Text style={styles.modalSectionTitle}>Ingredients:</Text>
              {selectedRecipe.extendedIngredients?.map((ing, idx) => (
                <Text key={idx} style={styles.ingredientItem}>
                  • {ing.original}
                </Text>
              ))}
              <Text style={styles.modalSectionTitle}>Instructions:</Text>
              {selectedRecipe.analyzedInstructions.length === 0 && (
                <Text>There not instructions</Text>
              )}
              {selectedRecipe.analyzedInstructions.map((instruction, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  {instruction.name ? (
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      {instruction.name}
                    </Text>
                  ) : null}
                  {instruction.steps.map((step) => (
                    <Text key={step.number} style={styles.instructionStep}>
                      {step.number}. {step.step}
                    </Text>
                  ))}
                </View>
              ))}
              <View style={{ marginTop: 20 }}>
                <Button color={'#4CAF50'} title="Close" onPress={closeRecipe} />
              </View>
            </>
          )}
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  recipeCard: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  recipeImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  nutrition: {
    marginTop: 5,
  },
  nutrientText: {
    fontSize: 12,
    color: '#444',
  },
  modalContainer: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  ingredientItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  instructionStep: {
    fontSize: 14,
    marginBottom: 4,
  },
});
