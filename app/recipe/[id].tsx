import { Image as ExpoImage } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Edit, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "@/components/Button";
import Colors from "@/constants/colors";
import { useRecipeStore } from "@/store/recipeStore";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getRecipe = useRecipeStore((state) => state.getRecipe);
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const recipe = getRecipe(id);

  const [showFullInstructions, setShowFullInstructions] = useState<number[]>([]);

  if (!recipe) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Recipe not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const toggleInstructionExpand = (index: number) => {
    setShowFullInstructions((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRecipe(id);
            router.replace("/");
          },
        },
      ]
    );
  };

  const editRecipe = () => {
    // This would navigate to an edit screen
    // For now, we'll just go back to the list
    Alert.alert(
      "Edit Recipe",
      "Editing functionality will be available in a future update.",
      [
        {
          text: "OK",
          style: "default",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "",
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={Colors.background} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable style={styles.iconButton} onPress={editRecipe}>
                <Edit size={20} color={Colors.background} />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={confirmDelete}>
                <Trash2 size={20} color={Colors.background} />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          {recipe.image ? (
            <ExpoImage
              source={{ uri: recipe.image }}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                {recipe.title.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.overlay} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.metaInfo}>
            {recipe.prepTime && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Prep</Text>
                <Text style={styles.metaValue}>{recipe.prepTime}</Text>
              </View>
            )}
            {recipe.cookTime && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Cook</Text>
                <Text style={styles.metaValue}>{recipe.cookTime}</Text>
              </View>
            )}
            {recipe.servings && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Serves</Text>
                <Text style={styles.metaValue}>{recipe.servings}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={`ingredient-${index}`} style={styles.ingredientItem}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((instruction, index) => {
              const isExpanded = showFullInstructions.includes(index);
              const isLongInstruction = instruction.length > 100;

              return (
                <Pressable
                  key={`instruction-${index}`}
                  style={styles.instructionItem}
                  onPress={() => isLongInstruction && toggleInstructionExpand(index)}
                >
                  <Text style={styles.instructionNumber}>{index + 1}</Text>
                  <View style={styles.instructionContent}>
                    <Text style={styles.instructionText}>
                      {isLongInstruction && !isExpanded
                        ? instruction.substring(0, 100) + "..."
                        : instruction}
                    </Text>
                    {isLongInstruction && (
                      <Text style={styles.expandText}>
                        {isExpanded ? "Show less" : "Show more"}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 72,
    fontWeight: "bold",
    color: Colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: "row",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metaItem: {
    marginRight: 24,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.background,
    textAlign: "center",
    lineHeight: 24,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 12,
    marginTop: 2,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  expandText: {
    color: Colors.primary,
    marginTop: 4,
    fontSize: 14,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
    color: Colors.text,
  },
});