import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Plus, Share } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, Alert, Platform } from "react-native";

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

  const shareRecordingLink = () => {
    const baseUrl = Platform.OS === 'web' 
      ? window.location.origin 
      : 'https://your-app-domain.com'; // Replace with your actual domain
    
    const shareUrl = `${baseUrl}/share/record`;
    
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        Alert.alert(
          "Link Copied!",
          "Share this link with someone to let them record a recipe for you:\n\n" + shareUrl,
          [{ text: "OK" }]
        );
      }).catch(() => {
        Alert.alert(
          "Share Recipe Recording",
          "Copy this link to share:\n\n" + shareUrl,
          [{ text: "OK" }]
        );
      });
    } else {
      Alert.alert(
        "Share Recipe Recording",
        "Copy this link to share:\n\n" + shareUrl,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Copy Link", 
            onPress: () => {
              // On mobile, you might want to use expo-clipboard here
              Alert.alert("Link Ready", "Share this link with someone to let them record a recipe for you.");
            }
          }
        ]
      );
    }
  };

  const navigateToImport = () => {
    router.push("/import");
  };

  if (recipes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyHeader}>
          <Pressable style={styles.shareButton} onPress={shareRecordingLink}>
            <Share size={20} color={Colors.sageGreen} />
          </Pressable>
        </View>
        <EmptyState
          message="No recipes yet"
          subMessage="Start by creating your first recipe or import one from a shared recording"
        />
        <View style={styles.emptyActions}>
          <Button
            title="Create Recipe"
            onPress={navigateToCreate}
            style={styles.createButton}
          />
          <Button
            title="Import Recording"
            onPress={navigateToImport}
            variant="outline"
            style={styles.importButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.shareButton} onPress={shareRecordingLink}>
            <Share size={20} color={Colors.sageGreen} />
          </Pressable>
          <Pressable style={styles.addButton} onPress={navigateToCreate}>
            <Plus size={24} color={Colors.sageGreen} />
          </Pressable>
        </View>
      </View>

      <FlashList
        data={sortedRecipes}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        estimatedItemSize={120}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.floatingActions}>
        <Button
          title="Import Recording"
          onPress={navigateToImport}
          variant="outline"
          style={styles.floatingImportButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 16,
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
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.paleSageGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightSageGreen,
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
  emptyActions: {
    position: "absolute",
    bottom: 32,
    left: 20,
    right: 20,
    gap: 12,
  },
  createButton: {
    width: "100%",
  },
  importButton: {
    width: "100%",
  },
  floatingActions: {
    position: "absolute",
    bottom: 32,
    right: 20,
  },
  floatingImportButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});