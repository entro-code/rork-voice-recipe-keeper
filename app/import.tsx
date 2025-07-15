import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";

import Button from "@/components/Button";
import Colors from "@/constants/colors";
import { useRecipeStore } from "@/store/recipeStore";
import { Recipe } from "@/types/recipe";

export default function ImportScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data?: string }>();
  const addRecipe = useRecipeStore((state) => state.addRecipe);

  const [importData, setImportData] = useState<any>(null);
  const [manualInput, setManualInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        setImportData(decoded);
      } catch (error) {
        console.error("Failed to parse import data:", error);
        Alert.alert(
          "Invalid Import Data",
          "The import link appears to be corrupted. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  }, [data]);

  const importRecipe = () => {
    if (!importData?.parsed) {
      Alert.alert("Error", "No recipe data to import");
      return;
    }

    setIsLoading(true);

    try {
      const recipe: Recipe = {
        id: Date.now().toString(),
        title: importData.parsed.title || "Imported Recipe",
        ingredients: importData.parsed.ingredients || [],
        instructions: importData.parsed.instructions || [],
        prepTime: importData.parsed.prepTime || "",
        cookTime: importData.parsed.cookTime || "",
        servings: importData.parsed.servings || undefined,
        createdAt: Date.now(),
      };

      addRecipe(recipe);
      
      Alert.alert(
        "Recipe Imported!",
        "The recipe has been successfully added to your collection.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to import recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualImport = () => {
    if (!manualInput.trim()) {
      Alert.alert("Error", "Please paste the import link");
      return;
    }

    try {
      // Extract data parameter from URL
      const url = new URL(manualInput);
      const dataParam = url.searchParams.get('data');
      
      if (!dataParam) {
        throw new Error("No data parameter found");
      }

      const decoded = JSON.parse(decodeURIComponent(dataParam));
      setImportData(decoded);
      setManualInput("");
    } catch (error) {
      Alert.alert(
        "Invalid Link",
        "The import link appears to be invalid. Please check and try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Import Recipe",
          headerStyle: {
            backgroundColor: Colors.cardBackground,
          },
          headerTintColor: Colors.text,
        }}
      />

      <ScrollView style={styles.content}>
        {importData ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Recipe Ready to Import</Text>
              <Text style={styles.subtitle}>
                Review the recipe details below and import it to your collection.
              </Text>
            </View>

            <View style={styles.recipePreview}>
              <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Title</Text>
                <Text style={styles.sectionContent}>
                  {importData.parsed?.title || "Untitled Recipe"}
                </Text>
              </View>

              {importData.parsed?.ingredients && importData.parsed.ingredients.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>
                    Ingredients ({importData.parsed.ingredients.length})
                  </Text>
                  {importData.parsed.ingredients.map((ingredient: string, index: number) => (
                    <Text key={index} style={styles.ingredientItem}>
                      • {ingredient}
                    </Text>
                  ))}
                </View>
              )}

              {importData.parsed?.instructions && importData.parsed.instructions.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>
                    Instructions ({importData.parsed.instructions.length} steps)
                  </Text>
                  {importData.parsed.instructions.map((instruction: string, index: number) => (
                    <Text key={index} style={styles.instructionItem}>
                      {index + 1}. {instruction}
                    </Text>
                  ))}
                </View>
              )}

              {(importData.parsed?.prepTime || importData.parsed?.cookTime || importData.parsed?.servings) && (
                <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>Details</Text>
                  {importData.parsed.prepTime && (
                    <Text style={styles.detailItem}>Prep Time: {importData.parsed.prepTime}</Text>
                  )}
                  {importData.parsed.cookTime && (
                    <Text style={styles.detailItem}>Cook Time: {importData.parsed.cookTime}</Text>
                  )}
                  {importData.parsed.servings && (
                    <Text style={styles.detailItem}>Servings: {importData.parsed.servings}</Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <Button
                title="Import Recipe"
                onPress={importRecipe}
                isLoading={isLoading}
                style={styles.importButton}
              />
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="outline"
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Import Recipe</Text>
              <Text style={styles.subtitle}>
                Paste the import link you received to add a recipe to your collection.
              </Text>
            </View>

            <View style={styles.manualImportSection}>
              <Text style={styles.inputLabel}>Import Link</Text>
              <TextInput
                style={styles.textInput}
                value={manualInput}
                onChangeText={setManualInput}
                placeholder="Paste the import link here..."
                placeholderTextColor={Colors.gray}
                multiline
                numberOfLines={4}
              />
              
              <Button
                title="Import from Link"
                onPress={handleManualImport}
                style={styles.manualImportButton}
              />
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>How it works:</Text>
              <Text style={styles.helpText}>
                1. Someone records a recipe using your shared link{"\n"}
                2. They send you back an import link{"\n"}
                3. Paste that link here to add the recipe to your collection
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  recipePreview: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.paleSageGreen,
  },
  previewSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  ingredientItem: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  instructionItem: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  detailItem: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  actions: {
    gap: 12,
  },
  importButton: {
    width: "100%",
    paddingVertical: 16,
  },
  manualImportSection: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.paleSageGreen,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
    textAlignVertical: "top",
    marginBottom: 16,
    minHeight: 100,
  },
  manualImportButton: {
    width: "100%",
  },
  helpSection: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
});