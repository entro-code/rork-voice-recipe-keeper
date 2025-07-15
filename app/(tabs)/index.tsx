import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import RecipeCard from "@/components/RecipeCard";
import Colors from "@/constants/colors";
import { useRecipeStore } from "@/store/recipeStore";

export default function RecipesScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);

  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => b.createdAt - a.createdAt);
  }, [recipes]);

  const navigateToCreate = () => {
    router.push("/create");
  };

  if (recipes.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          message="No recipes yet"
          subMessage="Start by creating your first recipe"
        />
        <Button
          title="Create Recipe"
          onPress={navigateToCreate}
          style={styles.createButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <Pressable style={styles.addButton} onPress={navigateToCreate}>
          <Plus size={24} color={Colors.sageGreen} />
        </Pressable>
      </View>

      <FlashList
        data={sortedRecipes}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        estimatedItemSize={120}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.paleSageGreen,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.paleSageGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightSageGreen,
  },
  listContent: {
    padding: 20,
  },
  createButton: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
  },
});