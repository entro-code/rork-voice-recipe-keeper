import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      {recipe.image ? (
        <Image source={{ uri: recipe.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            {recipe.title.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>
        <View style={styles.details}>
          {recipe.prepTime && (
            <Text style={styles.detail}>Prep: {recipe.prepTime}</Text>
          )}
          {recipe.cookTime && (
            <Text style={styles.detail}>Cook: {recipe.cookTime}</Text>
          )}
          {recipe.servings && (
            <Text style={styles.detail}>Serves: {recipe.servings}</Text>
          )}
        </View>
        <Text style={styles.ingredients} numberOfLines={1}>
          {recipe.ingredients.length} ingredients
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.paleSageGreen,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    margin: 8,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: Colors.sageGreen,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    margin: 8,
  },
  imagePlaceholderText: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 6,
  },
  detail: {
    fontSize: 12,
    color: Colors.darkSageGreen,
    backgroundColor: Colors.paleSageGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ingredients: {
    fontSize: 14,
    color: Colors.sageAccent,
    fontWeight: "500",
  },
});